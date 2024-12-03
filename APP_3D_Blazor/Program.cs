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

var staticFilePath = Path.Combine(builder.Environment.ContentRootPath, "models_Object3d");

if (Directory.Exists(staticFilePath))
{
	app.UseStaticFiles(new StaticFileOptions
	{
		FileProvider = new PhysicalFileProvider(staticFilePath),
		RequestPath = "/models_Object3d",
		ServeUnknownFileTypes = true,
		DefaultContentType = "application/octet-stream",
	});
}
else
{
	Console.WriteLine("Warning: Directory models_Object3d does not exist. Static file serving skipped.");
}
app.UseStaticFiles();
app.UseRouting();


app.MapBlazorHub();
app.MapFallbackToPage("/_Host");
// add commit test 
app.Run();
