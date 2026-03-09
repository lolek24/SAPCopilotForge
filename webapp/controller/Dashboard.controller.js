sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.sap.app.controller.Dashboard", {

        onInit: function () {
            var oModel = new JSONModel({
                tiles: {
                    orders: { value: "1247", indicator: "Up", valueColor: "Good", state: "Loaded" },
                    materials: { value: "8432", indicator: "Up", valueColor: "Neutral", state: "Loaded" },
                    invoices: { value: "89", indicator: "Down", valueColor: "Critical", state: "Loaded" },
                    alerts: { value: "7", state: "Loaded" }
                },
                recentOrders: [
                    { id: "PO-4500001234", vendor: "SAP SE", amount: "12.500,00", currency: "EUR", statusText: "Zatwierdzone", statusState: "Success", statusIcon: "sap-icon://accept", date: "07.03.2026" },
                    { id: "PO-4500001235", vendor: "Microsoft Corp", amount: "8.200,00", currency: "EUR", statusText: "W trakcie", statusState: "Information", statusIcon: "sap-icon://process", date: "08.03.2026" },
                    { id: "PO-4500001236", vendor: "AWS Inc", amount: "45.000,00", currency: "EUR", statusText: "Oczekujące", statusState: "Warning", statusIcon: "sap-icon://pending", date: "08.03.2026" },
                    { id: "PO-4500001237", vendor: "Google Cloud", amount: "3.750,00", currency: "EUR", statusText: "Zatwierdzone", statusState: "Success", statusIcon: "sap-icon://accept", date: "06.03.2026" },
                    { id: "PO-4500001238", vendor: "Oracle Corp", amount: "21.300,00", currency: "EUR", statusText: "Odrzucone", statusState: "Error", statusIcon: "sap-icon://decline", date: "05.03.2026" }
                ]
            });
            this.getView().setModel(oModel, "dashboard");
        },

        _getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        onTilePress: function (oEvent) {
            var sHeader = oEvent.getSource().getHeader();
            MessageToast.show(this._getText("dashboardOpening", [sHeader]));
        },

        onOrderPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("dashboard");
            var sOrderId = oContext.getProperty("id");
            MessageToast.show(this._getText("dashboardOrderDetails", [sOrderId]));
        },

        onOrderSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.byId("recentOrdersTable");
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

        onRefreshOrders: function () {
            MessageToast.show(this._getText("dashboardRefreshing"));
        },

        onCreateOrder: function () {
            MessageBox.information(this._getText("dashboardCreateInfo"));
        },

        onGoodsReceipt: function () {
            MessageToast.show(this._getText("dashboardGoodsReceiptWip"));
        },

        onInvoiceVerify: function () {
            this.getOwnerComponent().getRouter().navTo("finance");
        },

        onStockReport: function () {
            this.getOwnerComponent().getRouter().navTo("materials");
        }
    });
});
