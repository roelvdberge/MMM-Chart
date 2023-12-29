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
                width: 600,
                height: 600,
                url: '',
                updateInterval: 300,
                chartConfig: {}
        },

        getScripts: function () {
                // return ["modules/" + this.name + "/node_modules/chart.js/dist/Chart.bundle.min.js"];
                return ["modules/MMM-Chart/node_modules/chart.js/dist/chart.umd.js",
                        "modules/MMM-Chart/node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js"];
        },

        start: function () {
                this.config = Object.assign({}, this.defaults, this.config);
                Log.info("Starting module: " + this.name);
                this.getJson();
                this.scheduleUpdate();
        },

        scheduleUpdate() {
                const self = this;
                const interval = this.config.updateInterval * 1000;
                setInterval(() => {
                        self.getJson();
                }, interval);
        },

        // Request node_helper to get json from url
        getJson() {
                this.sendSocketNotification("MMM-Chart_GET_JSON", this.config.url);
        },

        socketNotificationReceived(notification, payload) {
                Log.info("Apparently received a socket notification: " + notification );
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
                        wrapperEl.innerHTML = "Loading...";
                        return wrapperEl;
                }

                Log.info(this.jsonData.data);

                this.config.chartConfig.data.datasets[0].data = this.jsonData.data;
                Log.info(this.config.chartConfig);

                // this.config.chartConfig
                // Create chart canvas
                const chartEl = document.createElement("canvas");

                // Init chart.js
                Chart.defaults.color = 'white';
                Chart.register(ChartDataLabels);
                var dataset = this.config.chartConfig.data.datasets[0];
                for (var i = 0; i < dataset.data.length; i++) {
                        if (dataset.data[i].x > 0) {
                                dataset.backgroundColor[i] = 'rgba(255,0,0,0.4)';
                                dataset.borderColor[i] = 'rgba(255,0,0,1)';
                        } else {
                                dataset.backgroundColor[i] = 'rgba(0,255,0,0.4)';
                                dataset.borderColor[i] = 'rgba(0,255,0,1)';
                        }
                }

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
