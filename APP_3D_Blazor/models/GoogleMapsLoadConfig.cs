using System.ComponentModel.DataAnnotations;

namespace APP_3D_Blazor.models;

public class GoogleMapsLoadConfig
{
    public required string ApiKey { get; set; }
    public string Version { get; set; } = "quarterly";
    public string Libraries { get; set; } = "maps,marker,geometry";
    public string Language { get; set; } = "fr";
    public string Region { get; set; } = "MA";
}