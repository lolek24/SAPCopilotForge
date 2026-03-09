sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("com.sap.app.controller.Materials", {

        onInit: function () {
            var oModel = new JSONModel({
                items: [
                    { id: "MAT-100001", name: "Laptop ThinkPad X1 Carbon Gen 12", type: "HAWA", stock: "150", unit: "SZT", plant: "1000", statusText: "Aktywny", statusState: "Success", stockState: "Success" },
                    { id: "MAT-100002", name: "Monitor Dell 27\" 4K UltraSharp", type: "HAWA", stock: "85", unit: "SZT", plant: "1000", statusText: "Aktywny", statusState: "Success", stockState: "Success" },
                    { id: "MAT-100003", name: "Klawiatura mechaniczna Logitech MX", type: "HAWA", stock: "12", unit: "SZT", plant: "2000", statusText: "Niski stan", statusState: "Warning", stockState: "Warning" },
                    { id: "MAT-100004", name: "Mysz bezprzewodowa Logitech MX Master", type: "HAWA", stock: "230", unit: "SZT", plant: "1000", statusText: "Aktywny", statusState: "Success", stockState: "Success" },
                    { id: "MAT-100005", name: "Kabel HDMI 2.1 3m", type: "ROH", stock: "0", unit: "SZT", plant: "1000", statusText: "Brak zapasu", statusState: "Error", stockState: "Error" },
                    { id: "MAT-100006", name: "Stacja dokująca USB-C Thunderbolt 4", type: "HAWA", stock: "45", unit: "SZT", plant: "2000", statusText: "Aktywny", statusState: "Success", stockState: "Success" },
                    { id: "MAT-100007", name: "Papier A4 80g biały", type: "ROH", stock: "5200", unit: "RYZ", plant: "1000", statusText: "Aktywny", statusState: "Success", stockState: "Success" },
                    { id: "MAT-100008", name: "Toner HP LaserJet Pro", type: "ROH", stock: "8", unit: "SZT", plant: "3000", statusText: "Niski stan", statusState: "Warning", stockState: "Warning" }
                ]
            });
            this.getView().setModel(oModel, "materials");
        },

        _getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("materialsTable").getBinding("items");
            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("id", FilterOperator.Contains, sQuery),
                        new Filter("name", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            oBinding.filter(aFilters);
        },

        onMaterialPress: function (oEvent) {
            var sId = oEvent.getSource().getBindingContext("materials").getProperty("id");
            MessageToast.show(this._getText("materialsDetail", [sId]));
        },

        onRefresh: function () {
            MessageToast.show(this._getText("materialsRefreshing"));
        },

        onCreate: function () {
            MessageToast.show(this._getText("materialsCreateHint"));
        }
    });
});
