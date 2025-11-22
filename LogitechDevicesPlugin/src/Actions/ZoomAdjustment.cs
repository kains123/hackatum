
namespace Loupedeck.LogitechDevicesPlugin
{
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;

    /// <summary>
    /// Dial adjustment for zoom in / out.
    /// Rotate the dial: diff > 0 => zoom in, diff < 0 => zoom out.
    /// </summary>
    public class ZoomAdjustment : PluginDynamicAdjustment
    {
        private static readonly HttpClient Http = new HttpClient();

        public ZoomAdjustment()
            : base(
                displayName: "Zoom",
                description: "Zoom in / out with the dial",
                groupName: "Adjustments",
                hasReset: false // set true if you want press to reset zoom
            )
        {
        }

        /// <summary>
        /// Called when the dial is rotated.
        /// diff: positive = clockwise, negative = counter-clockwise.
        /// </summary>
        protected override void ApplyAdjustment(String actionParameter, Int32 diff)
        {
            // Ignore tiny noise if you want
            if (diff == 0)
                return;

            Console.WriteLine($"[ZoomAdjustment] diff={diff}");

            // Fire-and-forget send to Node.js
            _ = SendZoomAsync(diff);
        }

        /// <summary>
        /// Optional: text shown under the dial.
        /// </summary>
        protected override String GetAdjustmentValue(String actionParameter) =>
            "Zoom";

        private static async Task SendZoomAsync(int delta)
        {
            try
            {
                // JSON payload for your Node server
                var json = $"{{\"type\":\"zoom\",\"delta\":{delta}}}";
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // Same port/path as your server.js
                var response = await Http.PostAsync("http://localhost:3001/control", content);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine(
                        $"[ZoomAdjustment] HTTP error: {(int)response.StatusCode} {response.ReasonPhrase}"
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ZoomAdjustment] Error sending zoom: {ex}");
            }
        }
    }
}
