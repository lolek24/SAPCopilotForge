sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("com.sap.app.controller.Orders", {

        onInit: function () {
            var oModel = new JSONModel({
                counts: { all: 12, approved: 6, pending: 4, rejected: 2 },
                items: [
                    { id: "4500001234", type: "NB - Zamówienie standardowe", vendor: "SAP SE", vendorCity: "Walldorf, DE", amount: "12.500,00", currency: "EUR", statusText: "Zatwierdzone", statusState: "Success", date: "07.03.2026", plant: "1000" },
                    { id: "4500001235", type: "NB - Zamówienie standardowe", vendor: "Microsoft Corp", vendorCity: "Redmond, US", amount: "8.200,00", currency: "EUR", statusText: "W trakcie", statusState: "Information", date: "08.03.2026", plant: "1000" },
                    { id: "4500001236", type: "NB - Zamówienie standardowe", vendor: "AWS Inc", vendorCity: "Seattle, US", amount: "45.000,00", currency: "EUR", statusText: "Oczekujące", statusState: "Warning", date: "08.03.2026", plant: "2000" },
                    { id: "4500001237", type: "NB - Zamówienie standardowe", vendor: "Google Cloud", vendorCity: "Mountain View, US", amount: "3.750,00", currency: "EUR", statusText: "Zatwierdzone", statusState: "Success", date: "06.03.2026", plant: "1000" },
                    { id: "4500001238", type: "NB - Zamówienie standardowe", vendor: "Oracle Corp", vendorCity: "Austin, US", amount: "21.300,00", currency: "EUR", statusText: "Odrzucone", statusState: "Error", date: "05.03.2026", plant: "1000" },
                    { id: "4500001239", type: "FO - Zamówienie ramowe", vendor: "IBM Deutschland", vendorCity: "Ehningen, DE", amount: "67.800,00", currency: "EUR", statusText: "Zatwierdzone", statusState: "Success", date: "04.03.2026", plant: "2000" },
                    { id: "4500001240", type: "NB - Zamówienie standardowe", vendor: "Dell Technologies", vendorCity: "Round Rock, US", amount: "15.420,00", currency: "EUR", statusText: "Oczekujące", statusState: "Warning", date: "03.03.2026", plant: "1000" },
                    { id: "4500001241", type: "NB - Zamówienie standardowe", vendor: "Lenovo Group", vendorCity: "Pekin, CN", amount: "9.100,00", currency: "EUR", statusText: "Zatwierdzone", statusState: "Success", date: "02.03.2026", plant: "3000" }
                ]
            });
            this.getView().setModel(oModel, "orders");
        },

        _getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
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

        onFilterSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");

            if (sKey === "all") {
                oBinding.filter([]);
            } else {
                var sStatus = { approved: "Zatwierdzone", pending: "Oczekujące", rejected: "Odrzucone" }[sKey];
                oBinding.filter(new Filter("statusText", FilterOperator.EQ, sStatus));
            }
        },

        onOrderPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("orders");
            MessageToast.show(this._getText("ordersDetail", [oContext.getProperty("id")]));
        },

        onCreateOrder: function () {
            MessageToast.show(this._getText("ordersCreateHint"));
        },

        onSort: function () { MessageToast.show(this._getText("ordersSorting")); },
        onGroup: function () { MessageToast.show(this._getText("ordersGrouping")); },
        onSettings: function () { MessageToast.show(this._getText("ordersTableSettings")); },
        onExport: function () { MessageToast.show(this._getText("ordersExport")); }
    });
});
