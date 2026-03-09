sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("com.sap.app.controller.App", {

        onInit: function () {
            // Chat model
            var oChatModel = new JSONModel({
                messages: [],
                isBusy: false
            });
            this.getView().setModel(oChatModel, "chat");
        },

        _getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        onSideNavToggle: function () {
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        onNavItemSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            this.getOwnerComponent().getModel("side").setProperty("/selectedKey", sKey);
            this.getOwnerComponent().getRouter().navTo(sKey);
        },

        onChatToggle: function () {
            var oChatPanel = this.byId("chatPanel");
            oChatPanel.setVisible(!oChatPanel.getVisible());
        },

        onChatSend: function () {
            var oInput = this.byId("chatInput");
            var sMessage = oInput.getValue().trim();
            if (!sMessage) {
                return;
            }

            var oChatModel = this.getView().getModel("chat");
            var aMessages = oChatModel.getProperty("/messages");

            // Add user message
            aMessages.push({
                role: this._getText("chatRoleUser"),
                content: sMessage,
                time: this._getTime(),
                isUser: true
            });
            oChatModel.setProperty("/messages", aMessages);
            oInput.setValue("");

            // Scroll to bottom
            this._scrollChatToBottom();

            // Send to agent
            this._sendToAgent(sMessage);
        },

        _sendToAgent: function (sMessage) {
            var that = this;
            var oChatModel = this.getView().getModel("chat");
            oChatModel.setProperty("/isBusy", true);

            // Check for navigation commands
            var oNavResult = this._checkNavigation(sMessage);
            if (oNavResult) {
                this._addAgentMessage(oNavResult);
                oChatModel.setProperty("/isBusy", false);
                return;
            }

            // Call LangGraph agent
            fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: sMessage })
            })
            .then(function (response) { return response.json(); })
            .then(function (data) {
                that._addAgentMessage(data.response || that._getText("chatErrorParse"));
            })
            .catch(function () {
                that._addAgentMessage(that._getText("chatErrorConnect"));
            })
            .finally(function () {
                oChatModel.setProperty("/isBusy", false);
            });
        },

        _checkNavigation: function (sMessage) {
            var sLower = sMessage.toLowerCase();
            var oRouter = this.getOwnerComponent().getRouter();
            var oSideModel = this.getOwnerComponent().getModel("side");

            var oRoutes = {
                "dashboard": ["dashboard", "pulpit", "strona główna", "home"],
                "orders": ["zamówieni", "orders", "zakup", "purchase"],
                "materials": ["materiał", "materials", "magazyn", "stock", "zapas"],
                "finance": ["finans", "faktur", "finance", "invoice", "księgow", "bilans"]
            };

            for (var sRoute in oRoutes) {
                var aKeywords = oRoutes[sRoute];
                for (var i = 0; i < aKeywords.length; i++) {
                    if (sLower.indexOf(aKeywords[i]) !== -1 &&
                        (sLower.indexOf("pokaż") !== -1 || sLower.indexOf("przejdź") !== -1 ||
                         sLower.indexOf("otwórz") !== -1 || sLower.indexOf("nawiguj") !== -1 ||
                         sLower.indexOf("idź") !== -1 || sLower.indexOf("go to") !== -1)) {
                        oRouter.navTo(sRoute);
                        oSideModel.setProperty("/selectedKey", sRoute);
                        return this._getText("chatNavTo", [sRoute]);
                    }
                }
            }
            return null;
        },

        _addAgentMessage: function (sContent) {
            var oChatModel = this.getView().getModel("chat");
            var aMessages = oChatModel.getProperty("/messages");
            aMessages.push({
                role: this._getText("chatRoleAgent"),
                content: sContent,
                time: this._getTime()
            });
            oChatModel.setProperty("/messages", aMessages);
            this._scrollChatToBottom();
        },

        onResendMessage: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("chat");
            var sContent = oContext.getProperty("content");
            var oInput = this.byId("chatInput");
            oInput.setValue(sContent);
            oInput.focus();
        },

        onClearChat: function () {
            this.getView().getModel("chat").setProperty("/messages", []);
            MessageToast.show(this._getText("chatCleared"));
        },

        _scrollChatToBottom: function () {
            var oList = this.byId("chatMessages");
            setTimeout(function () {
                var aItems = oList.getItems();
                if (aItems.length > 0) {
                    var oDomRef = aItems[aItems.length - 1].getDomRef();
                    if (oDomRef) {
                        oDomRef.scrollIntoView({ behavior: "smooth" });
                    }
                }
            }, 100);
        },

        _getTime: function () {
            var oDate = new Date();
            return oDate.getHours().toString().padStart(2, "0") + ":" +
                   oDate.getMinutes().toString().padStart(2, "0");
        }
    });
});
