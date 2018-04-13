using Pc.PcBoard.BaseComponent.Base;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Pc.PcBoard.BaseComponent.Config
{
	public class WebConfigManager : WebInfoEntity
	{
		#region Fields
		private static WebConfigManager _instance = new WebConfigManager();
		#endregion


		#region Constructor
		public WebConfigManager()
		{
			InitSiteUrl();
		}
		#endregion

		#region Methods
		protected void InitSiteUrl()
		{
			this._siteUrl  = ConfigurationManager.AppSettings["SiteUrl"];
			this._resourceUrl = ConfigurationManager.AppSettings["SiteResourceUrl"];
		}

		public static WebConfigManager GetInstance()
		{
			return _instance;
		}


		public string GetSiteUrl()
		{
			return this._siteUrl;
		}
		public string GetSiteUrl(string url)
		{
			string resultUrl = "";

			// http로 넘어올 떄
			if (Regex.IsMatch(url, @"http[s]?:\/\/.*", RegexOptions.IgnoreCase | RegexOptions.IgnorePatternWhitespace))
			{
				return url;
			}

			// 서브 Url이 넘어올 때
			if (!url.StartsWith("/"))
			{
				resultUrl = _siteUrl + "/";
			}

			resultUrl += url;

			return resultUrl;
		}

		public string GetResourceUrl()
		{
			return this._resourceUrl;
		}
		public string GetResourceUrl(string url)
		{
			string resultUrl = "";

			if (Regex.IsMatch(url, @"http[s]?:\/\/.*", RegexOptions.IgnoreCase | RegexOptions.IgnorePatternWhitespace))
			{
				return url;
			}

			// 서브 Url이 넘어올 때
			if (!url.StartsWith("/"))
			{
				resultUrl = _resourceUrl + "/";
			}

			resultUrl += url;

			return resultUrl;
		}

		#endregion


	}
}
