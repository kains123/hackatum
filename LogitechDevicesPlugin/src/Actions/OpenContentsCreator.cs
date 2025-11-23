namespace Loupedeck.LogitechDevicesPlugin
{
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;
    using System.Diagnostics; // 새 창(프로세스)을 띄우기 위해 필요

    public class OpenContentsCreator : PluginDynamicCommand
    {
        private int _counter = 0;
        private static readonly HttpClient Http = new HttpClient();
        
        // 문제의 URL을 TargetUrl로 사용합니다.
        private const string TargetUrl = "http://localhost:5173"; 

        public OpenContentsCreator()
            : base(displayName: "Open Contents Creator", description: "Opens AI Tool URL", groupName: "Commands")
        {
        }

        // Called when the user presses the command button
        protected override void RunCommand(string actionParameter)
        {
            _counter++;
            this.ActionImageChanged();

            Console.WriteLine($"[OpenContentsCreator] Button Pressed: {_counter}");

            // =========================================================
            // [핵심 기능] 웹 브라우저로 새 창 띄우기 (Target URL)
            // =========================================================
            try
            {
                // Process.StartInfo를 사용하여 URL을 실행합니다.
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = TargetUrl,
                    UseShellExecute = true 
                });
                Console.WriteLine($"[OpenContentsCreator] Attempted to open URL: {TargetUrl}");
            }
            catch (Exception ex)
            {
                // 실패 시 콘솔에 상세한 에러 로그를 남깁니다.
                Console.WriteLine($"[OpenContentsCreator] Error opening URL: {ex.Message}");
                // Process.Start가 실패하는 경우, 예를 들어 URL 포맷이 이상하거나 
                // 시스템에 웹 브라우저가 정의되지 않은 경우 발생할 수 있습니다.
            }
            // =========================================================

            // 기존 HTTP POST 요청 (유지)
            _ = SendCountAsync(_counter);
        }

        protected override string GetCommandDisplayName(string actionParameter, PluginImageSize imageSize) =>
            $"Open \nContents \nCreator {Environment.NewLine}";
            
        private static async Task SendCountAsync(int count)
        {
            try
            {
                var json = $"{{\"type\":\"OpenContentsCreator\",\"count\":{count}}}";
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                // 이 요청은 별도의 API 요청이며 새 창을 띄우는 기능과는 독립적입니다.
                var response = await Http.PostAsync(TargetUrl, content); // TargetUrl이 POST 요청 URL과 동일하다면 사용

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[ContentGenerativeGPT] HTTP error: {(int)response.StatusCode} {response.ReasonPhrase}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ContentGenerativeGPT] Error sending count: {ex.Message}");
            }
        }
    }
}