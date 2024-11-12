namespace APP_3D_Blazor.models;

public record GoogleMapCoordinate3D(double Lat ,double Lng,double Altitude);

public record GoogleMapOptions3D(
	string ElementId,
	string MapId,
	GoogleMapCoordinate3D Center,
	double  heading,
	double tilt, 
	bool defaultLabelsDisabled,
	int? Zoom = 10 , 
	object ? Controls = null
	);
