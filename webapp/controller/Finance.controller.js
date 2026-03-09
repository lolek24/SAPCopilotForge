sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("com.sap.app.controller.Finance", {

        onInit: function () {
            var oModel = new JSONModel({
                kpi: {
                    assets: "2.450.000,00",
                    liabilities: "980.000,00",
                    equity: "1.470.000,00",
                    netResult: "345.000,00"
                },
                invoices: [
                    { id: "INV-9000001001", vendor: "SAP SE", amount: "12.500,00", currency: "EUR", dueDate: "07.04.2026", statusText: "Zapłacona", statusState: "Success" },
                    { id: "INV-9000001002", vendor: "AWS Inc", amount: "45.000,00", currency: "EUR", dueDate: "08.04.2026", statusText: "Otwarta", statusState: "Warning" },
                    { id: "INV-9000001003", vendor: "Microsoft Corp", amount: "8.200,00", currency: "EUR", dueDate: "15.04.2026", statusText: "Otwarta", statusState: "Warning" },
                    { id: "INV-9000001004", vendor: "Oracle Corp", amount: "21.300,00", currency: "EUR", dueDate: "01.03.2026", statusText: "Przeterminowana", statusState: "Error" },
                    { id: "INV-9000001005", vendor: "IBM Deutschland", amount: "67.800,00", currency: "EUR", dueDate: "20.04.2026", statusText: "Otwarta", statusState: "Warning" },
                    { id: "INV-9000001006", vendor: "Dell Technologies", amount: "15.420,00", currency: "EUR", dueDate: "25.03.2026", statusText: "Zapłacona", statusState: "Success" }
                ]
            });
            this.getView().setModel(oModel, "finance");
        },

        _getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("invoicesTable").getBinding("items");
            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("id", FilterOperator.Contains, sQuery),
                        new Filter("vendor", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            oBinding.filter(aFilters);
        },

        onInvoicePress: function (oEvent) {
            var sId = oEvent.getSource().getBindingContext("finance").getProperty("id");
            MessageToast.show(this._getText("financeDetail", [sId]));
        },

        onRefresh: function () {
            MessageToast.show(this._getText("financeRefreshing"));
        }
    });
});
