﻿using APP_3D_Blazor.models;
using Microsoft.JSInterop;

namespace APP_3D_Blazor.Helper;

public static class Extensions
{
    public static async Task ImportCustormGoogeleMapsJsAsync(this IJSRuntime jSRuntime)
    {
        await jSRuntime.InvokeVoidAsync("import", "./main/custom-google-maps.js");
    }
    public static ValueTask LoadGooglemapsApiAsync(this IJSRuntime jSRuntime, GoogleMapsLoadConfig config)
    {
        var jsConfig = new
        {
            apikey = config.ApiKey,
            version = config.Version,
            libraries = config.Libraries,
            language = config.Language,
            region = config.Region
        };
        return jSRuntime.InvokeVoidAsync("CustomGoogleMapsJs.LoadMapsApi", jsConfig);
    }
    public static ValueTask InitGoogleMaps2DAsync(this IJSRuntime jSRuntime, GoogleMapOptions2D mapOptions)
    {
        return jSRuntime.InvokeVoidAsync("CustomGoogleMapsJs.initMapa2Dsync", mapOptions);
    }
    public static ValueTask InitGoogleMaps3DAsync(this IJSRuntime jSRuntime, GoogleMapOptions3D mapOptions)
    {
        return jSRuntime.InvokeVoidAsync("CustomGoogleMapsJs.initMapa3Dsync", mapOptions);
    }
}
