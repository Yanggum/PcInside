using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pc.PcBoard.BaseComponent.Base
{
	public class WebInfoEntity : BaseEntity
	{
		#region Fields
		protected string _siteUrl = "";
		protected string _resourceUrl = "";
		#endregion

		#region Properties
		public string SiteUrl {
			get
			{
				return _siteUrl;
			}
		}
		public string ResourceUrl
		{
			get
			{
				return _resourceUrl;
			}
		}
		#endregion

		#region Constructor
		public WebInfoEntity()
		{

		}
		#endregion
	}
}
