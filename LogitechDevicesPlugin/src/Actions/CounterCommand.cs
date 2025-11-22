namespace Loupedeck.LogitechDevicesPlugin
{
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;

    // This class implements an example command that counts button presses.
    public class CounterCommand : PluginDynamicCommand
    {
        private int _counter = 0;
        private static readonly HttpClient Http = new HttpClient();

        public CounterCommand()
            : base(displayName: "Press Counter", description: "Counts button presses", groupName: "Commands")
        {
        }

        // Called when the user presses the command button
        protected override void RunCommand(string actionParameter)
        {
            _counter++;
            this.ActionImageChanged(); // update display on device

            Console.WriteLine($"[CounterCommand] Counter value is {_counter}");

            // Fire-and-forget send to Node.js server
            _ = SendCountAsync(_counter);
        }

        // Text shown on the key / UI
        protected override string GetCommandDisplayName(string actionParameter, PluginImageSize imageSize) =>
            $"Press Counter{Environment.NewLine}{_counter}";

        // POST the current count to Node.js server
        private static async Task SendCountAsync(int count)
        {
            try
            {
                var json = $"{{\"type\":\"pressCount\",\"count\":{count}}}";
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await Http.PostAsync("http://localhost:3001/control", content);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[CounterCommand] HTTP error: {(int)response.StatusCode} {response.ReasonPhrase}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CounterCommand] Error sending count: {ex}");
            }
        }
    }
}
