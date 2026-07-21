using Final_Project_Maui.Services;
using Microsoft.Extensions.Logging;

namespace Final_Project_Maui
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                });

            builder.Services.AddMauiBlazorWebView();

            // Register HttpClient with your API base URL
            builder.Services.AddScoped(sp =>
            {
                var handler = new HttpClientHandler();
                handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;
                return new HttpClient(handler)
                {
                    BaseAddress = new Uri("http://localhost:5200")
                };
            });
            // Register our service
            builder.Services.AddScoped<ItemCategoryService>();
            builder.Services.AddScoped<AuthorService>();

#if DEBUG
            builder.Services.AddBlazorWebViewDeveloperTools();
    		builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
