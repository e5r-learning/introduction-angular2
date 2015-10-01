using Microsoft.AspNet.Builder;
using Microsoft.AspNet.StaticFiles;
using Microsoft.Framework.DependencyInjection;

public class Startup
{
	public void Configure(IApplicationBuilder app)
	{
		app.UseFileServer();
	}
}