using Pc.PcBoard.BaseComponent.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pc.PcBoard.BaseComponent.Base
{
	/// <summary>
	/// 사이트 기본 페이지
	/// </summary>
	public class SiteBasePage : System.Web.UI.Page
	{
		public WebConfigManager WebConfig { get; set; }

		public SiteBasePage() : base()
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
