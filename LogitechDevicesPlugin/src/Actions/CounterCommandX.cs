namespace Loupedeck.LogitechDevicesPlugin
{
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;

    // This class implements an example command that counts button presses.
    public class CounterCommandX : PluginDynamicCommand
    {
        private int _counter = 0;
        private static readonly HttpClient Http = new HttpClient();

        public CounterCommandX()
            : base(displayName: "Rotate X", description: "Counts button presses", groupName: "Commands")
        {
        }

        // Called when the user presses the command button
        protected override void RunCommand(string actionParameter)
        {
            _counter++;
            this.ActionImageChanged(); // update display on device

            Console.WriteLine($"[CounterCommandX] Counter value is {_counter}");

            // Fire-and-forget send to Node.js server
            _ = SendCountAsync(_counter);
        }

        // Text shown on the key / UI
        protected override string GetCommandDisplayName(string actionParameter, PluginImageSize imageSize) =>
            $"Rotate X {Environment.NewLine}";
        // POST the current count to Node.js server
        private static async Task SendCountAsync(int count)
        {
            try
            {
                var json = $"{{\"type\":\"pressCountX\",\"count\":{count}}}";
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await Http.PostAsync("http://localhost:3001/control", content);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[CounterCommandX] HTTP error: {(int)response.StatusCode} {response.ReasonPhrase}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CounterCommandX] Error sending count: {ex}");
            }
        }
    }
}
