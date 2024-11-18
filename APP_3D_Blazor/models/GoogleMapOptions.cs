namespace APP_3D_Blazor.models;

public record GoogleMapOptions2D(
	 string elementId,
	GoogleMapCoordinate2D center,
	 double zoom,
	 string ? mapId = null ,
	 object ? controls=null
	);

public record GoogleMapCoordinate2D(double Lat, double Lng);