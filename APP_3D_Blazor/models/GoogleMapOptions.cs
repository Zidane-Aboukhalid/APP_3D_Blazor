namespace APP_3D_Blazor.models;

public record GoogleMapOptions2D(
	 string elementId,
	 string mapId,
	GoogleMapCoordinate2D center,
	 double zoom,
	 object ? controls=null
	);

public record GoogleMapCoordinate2D(double Lat, double Lng);