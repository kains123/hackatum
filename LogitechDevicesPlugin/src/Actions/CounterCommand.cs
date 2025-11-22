namespace Loupedeck.MxMaster4Plugin
{
    using System;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;

    // This class implements an example command that counts button presses
    // and sends the count to the Node server.
    public class CounterCommand : PluginDynamicCommand
    {
        private Int32 _counter = 0;

        // Reuse a single HttpClient for all instances
        private static readonly HttpClient Http = new HttpClient();

        public CounterCommand()
            : base(displayName: "Press Counter",
                   description: "Counts button presses and posts count",
                   groupName: "Commands")
        {
        }

        protected override void RunCommand(String actionParameter)
        {
            this._counter++;
            this.ActionImageChanged(); // update text on button
            // PluginLog.Info($"Counter value is {this._counter}");

            // fire-and-forget HTTP call
            _ = SendCountAsync(this._counter);
        }

        protected override String GetCommandDisplayName(String actionParameter,
            PluginImageSize imageSize) =>
            $"Press Counter{Environment.NewLine}{this._counter}";

        private async Task SendCountAsync(int count)
        {
            try
            {
                // JSON body we’ll send to Node
                var json = $"{{\"type\":\"pressCount\",\"count\":{count}}}";
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await Http.PostAsync("http://localhost:3001/control", content);
                // PluginLog.Info($"[CounterCommand] Sent count={count}, status={(int)response.StatusCode}");
            }
            catch (Exception ex)
            {
                // PluginLog.Error($"[CounterCommand] Error sending count: {ex}");
            }
        }
    }
}
