using System;

namespace Pc.PcBoard.Resources.MultilangApi {

	public class MultiLang {

		/// <summary>
		/// 'PcInside' 와 유사한 다국어 메시지를 가져옵니다.
		/// </summary>
		public static string WebTitle
		{ get { return MultilangManager.Instance.Get("WebTitle"); } }

	}

}