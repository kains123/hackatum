namespace Loupedeck.LogitechDevicesPlugin
{
    using System;
    using System.Globalization;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;

    /// <summary>
    /// Implements fine-grained zoom adjustment for 3D applications using the dial (0.01x increments).
    /// </summary>
    public class ZoomAdjustment : PluginDynamicAdjustment
    {
        private static readonly HttpClient Http = new HttpClient();

        // **1. 상태 관리 변수**
        private static float currentZoomLevel = 1.0f; 

        // **2. 제어 상수**
        private const float MIN_ZOOM = 0.5f; 
        private const float MAX_ZOOM = 3.0f; 
        private const float ZOOM_INCREMENT = 0.01f; 

        public ZoomAdjustment()
            : base(
                displayName: "3D Zoom (0.01x)",
                description: $"Zoom in / out with the dial (Range: {MIN_ZOOM}x - {MAX_ZOOM}x)",
                groupName: "3D Adjustments",
                // 다이얼 누름(Reset) 기능을 사용하지 않으므로 false로 설정합니다.
                hasReset: false 
            )
        {
        }

        /// <summary>
        /// Called when the dial is rotated.
        /// </summary>
        protected override void ApplyAdjustment(string actionParameter, Int32 diff)
        {
            if (diff == 0)
                return;

            float delta = diff * ZOOM_INCREMENT;
            float newZoomLevel = currentZoomLevel + delta;

            // 최소/최대 범위 제한 (Clamping)
            if (newZoomLevel < MIN_ZOOM)
            {
                newZoomLevel = MIN_ZOOM;
            }
            else if (newZoomLevel > MAX_ZOOM)
            {
                newZoomLevel = MAX_ZOOM;
            }

            currentZoomLevel = newZoomLevel;

            Console.WriteLine($"[ZoomAdjustment] diff={diff}, newZoom={currentZoomLevel:F2}");
            
            this.AdjustmentValueChanged(); 

            // 현재 줌 레벨을 Node.js로 전달
            _ = SendZoomAsync(currentZoomLevel);
        }

        // ResetAdjustment 메서드는 hasReset: false 이므로 구현하지 않습니다.

        /// <summary>
        /// The text shown under the dial, displaying the current zoom factor.
        /// </summary>
        protected override string GetAdjustmentValue(string actionParameter) =>
            $"{currentZoomLevel.ToString("F2", CultureInfo.InvariantCulture)}x"; 

        private static async Task SendZoomAsync(float zoomValue)
        {
            try
            {
                var json = $"{{\"type\":\"zoom\",\"value\":{zoomValue.ToString("F2", CultureInfo.InvariantCulture)}}}";
                var content = new StringContent(json, Encoding.UTF8, "application/json");

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