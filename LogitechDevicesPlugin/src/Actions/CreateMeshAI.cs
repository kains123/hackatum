namespace Loupedeck.LogitechDevicesPlugin
{
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;
    using System.Diagnostics; // <--- 새 창(프로세스)을 띄우기 위해 추가

    // This class implements a command to open the Meshy AI workspace.
    public class CreateMeshAI : PluginDynamicCommand
    {
        private int _counter = 0;
        private static readonly HttpClient Http = new HttpClient();
        
        // 새 창으로 띄울 URL을 여기에 정의합니다.
        private const string TargetUrl = "https://www.meshy.ai/workspace"; 

        public CreateMeshAI()
            : base(displayName: "Create Mesh AI", description: "Opens Meshy AI Workspace", groupName: "Commands")
        {
        }

        // Called when the user presses the command button
        protected override void RunCommand(string actionParameter)
        {
            _counter++;
            this.ActionImageChanged(); // update display on device

            Console.WriteLine($"[CreateMeshAI] Button Pressed: {_counter}");

            // =========================================================
            // [핵심 기능] 웹 브라우저로 새 창 띄우기 (Target URL)
            // =========================================================
            try
            {
                // Process.Start를 사용하여 웹 브라우저로 URL을 엽니다.
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = TargetUrl,
                    UseShellExecute = true // 기본 웹 브라우저를 사용하도록 설정
                });
                Console.WriteLine($"[CreateMeshAI] Opened URL: {TargetUrl}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CreateMeshAI] Error opening URL: {ex.Message}");
            }
            // =========================================================

            // Fire-and-forget send to Node.js server (기존 HTTP POST 요청)
            // 브라우저를 띄우는 것과 별개로 서버에 신호를 보냅니다.
            _ = SendCountAsync(_counter);
        }

        // Text shown on the key / UI
        protected override string GetCommandDisplayName(string actionParameter, PluginImageSize imageSize) =>
            $"Create Mesh {Environment.NewLine}";
            
        // POST the current count to Node.js server
        private static async Task SendCountAsync(int count)
        {
            try
            {
                var json = $"{{\"type\":\"CreateMeshAI\",\"count\":{count}}}";
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                // POST 요청 URL도 TargetUrl과 동일하게 유지했습니다.
                var response = await Http.PostAsync(TargetUrl, content); 

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[CreateMeshAI] HTTP error: {(int)response.StatusCode} {response.ReasonPhrase}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CreateMeshAI] Error sending count: {ex}");
            }
        }
    }
}