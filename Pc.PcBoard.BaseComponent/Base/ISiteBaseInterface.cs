using Pc.PcBoard.BaseComponent.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pc.PcBoard.BaseComponent.Base
{
	interface ISiteBaseInterface
	{
		#region Properties
		WebConfigManager WebConfig { get; set; }
		#endregion

		#region Methods
		string GetSiteUrl();
		string GetSiteUrl(string url);
		string GetResourceUrl();
		string GetResourceUrl(string url);
		#endregion
	}
}
