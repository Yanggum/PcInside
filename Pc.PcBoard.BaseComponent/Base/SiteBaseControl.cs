using Pc.PcBoard.BaseComponent.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pc.PcBoard.BaseComponent.Base
{
	/// <summary>
	/// 사이트 기본 컨트롤
	/// </summary>
	public class SiteBaseControl : System.Web.UI.UserControl, ISiteBaseInterface
	{
		public WebConfigManager WebConfig { get; set; }

		public SiteBaseControl() : base()
		{
			WebConfig = WebConfigManager.GetInstance();
		}

		public string GetSiteUrl()
		{
			return WebConfig.GetSiteUrl();
		}

		public string GetSiteUrl(string url)
		{
			return WebConfig.GetSiteUrl(url);
		}

		public string GetResourceUrl()
		{
			return WebConfig.GetResourceUrl();
		}

		public string GetResourceUrl(string url)
		{
			return WebConfig.GetResourceUrl(url);
		}
	}
}
