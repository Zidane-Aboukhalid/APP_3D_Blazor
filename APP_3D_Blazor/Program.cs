using APP_3D_Blazor;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
	app.UseExceptionHandler("/Error");
	app.UseHsts();
}

app.UseHttpsRedirection();

// Define the path for static files (3D models)
var staticFilePath = Path.Combine(builder.Environment.ContentRootPath, "models_Object3d");

if (Directory.Exists(staticFilePath))
{
	// Define MIME types if needed
	var contentTypeProvider = new FileExtensionContentTypeProvider();
	contentTypeProvider.Mappings[".obj"] = "application/x-tgif"; // Example for .obj files
	contentTypeProvider.Mappings[".mtl"] = "application/x-tgif"; // Example for .mtl files

	// Serve static files from the directory
	app.UseStaticFiles(new StaticFileOptions
	{
		FileProvider = new PhysicalFileProvider(staticFilePath),
		RequestPath = "/models_Object3d",
		ServeUnknownFileTypes = true, // Allow serving files without a known MIME type
		ContentTypeProvider = contentTypeProvider,
		DefaultContentType = "application/octet-stream" // Default MIME type
	});

	Console.WriteLine($"Static files will be served from: {staticFilePath}");
}
else
{
	Console.WriteLine("Warning: Directory 'models_Object3d' does not exist. Static file serving skipped.");
}

// Add default static file serving (wwwroot)
app.UseStaticFiles();

// Add routing
app.UseRouting();

// Map Blazor endpoints
app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

// Run the application
app.Run();
