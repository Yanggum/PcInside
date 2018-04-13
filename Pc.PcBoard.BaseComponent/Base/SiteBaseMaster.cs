using Pc.PcBoard.BaseComponent.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pc.PcBoard.BaseComponent.Base
{
	/// <summary>
	/// 마스터 페이지 컨트롤
	/// </summary>
	public class SiteBaseMaster : System.Web.UI.MasterPage, ISiteBaseInterface
	{
		public WebConfigManager WebConfig { get; set; }

		public SiteBaseMaster() : base()
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
