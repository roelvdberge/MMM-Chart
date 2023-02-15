/* global Module */

/* Magic Mirror
 * Module: MMM-Chart
 *
 * By Evghenii Marinescu https://github.com/MarinescuEvghenii/
 * MIT Licensed.
 */

Module.register("MMM-Chart", {
        jsonData: null,
        defaults: {
                width: 200,
                height: 200,
                url: 'http://192.168.1.88:12346/test/energie',
                updateInterval: 15000,
                chartConfig: {}
        },

        getScripts: function () {
                return ["modules/" + this.name + "/node_modules/chart.js/dist/Chart.bundle.min.js"];
        },

        start: function () {
                this.config = Object.assign({}, this.defaults, this.config);
                Log.info("Starting module: " + this.name);
                this.getJson();
                this.scheduleUpdate();
        },

        scheduleUpdate() {
                const self = this;
                setInterval(() => {
                        self.getJson();
                }, this.config.updateInterval);
        },

        // Request node_helper to get json from url
        getJson() {
                this.sendSocketNotification("MMM-Chart_GET_JSON", this.config.url);
        },

        socketNotificationReceived(notification, payload) {
                if (notification === "MMM-Chart_JSON_RESULT") {
                        // Only continue if the notification came from the request we made
                        // This way we can load the module more than once
                        if (payload.url === this.config.url) {
                                this.jsonData = payload.data;
                                this.updateDom(this.config.animationSpeed);
                        }
                }
        },

        getDom: function () {
                // Create wrapper element
                const wrapperEl = document.createElement("div");
                wrapperEl.setAttribute("style", "position: relative; display: inline-block;");

                if (!this.jsonData) {
                        wrapperEl.innerHTML = "Awaiting json data...";
                        return wrapperEl;
                }

                Log.info(this.jsonData);

                // this.config.chartConfig
                // Create chart canvas
                const chartEl = document.createElement("canvas");

                // Init chart.js
                this.chart = new Chart(chartEl.getContext("2d"), this.config.chartConfig);

                // Set the size
                chartEl.width = this.config.width;
                chartEl.height = this.config.height;
                chartEl.setAttribute("style", "display: block;");

                // Append chart
                wrapperEl.appendChild(chartEl);

                return wrapperEl;
        }
});
