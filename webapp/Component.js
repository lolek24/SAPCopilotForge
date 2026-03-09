sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, JSONModel) {
    "use strict";

    return UIComponent.extend("com.sap.app.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // Device model
            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            // Side navigation model
            var oSideModel = new JSONModel({
                selectedKey: "dashboard",
                navigation: [
                    { title: "Dashboard", icon: "sap-icon://home", key: "dashboard" },
                    { title: "Zamówienia", icon: "sap-icon://sales-order", key: "orders" },
                    { title: "Materiały", icon: "sap-icon://product", key: "materials" },
                    { title: "Finanse", icon: "sap-icon://money-bills", key: "finance" }
                ]
            });
            this.setModel(oSideModel, "side");

            this.getRouter().initialize();
        }
    });
});
