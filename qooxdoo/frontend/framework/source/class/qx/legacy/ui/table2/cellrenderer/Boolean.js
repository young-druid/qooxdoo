/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Carsten Lergenmueller (carstenl)

************************************************************************ */

/* ************************************************************************

#asset(qx/decoration/Classic/table/boolean-true.png)
#asset(qx/decoration/Classic/table/boolean-false.png)
#asset(qx/static/image/blank.gif)

************************************************************************ */

/**
 * A data cell renderer for boolean values.
 */
qx.Class.define("qx.legacy.ui.table2.cellrenderer.Boolean",
{
  extend : qx.legacy.ui.table2.cellrenderer.Icon,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var ResourceMgr = qx.util.ResourceManager;

    this._iconUrlTrue = ResourceMgr.toUri(qx.legacy.util.AliasManager.getInstance().resolve("widget/table/boolean-true.png"));
    this._iconUrlFalse = ResourceMgr.toUri(qx.legacy.util.AliasManager.getInstance().resolve("widget/table/boolean-false.png"));
    this._iconUrlNull = ResourceMgr.toUri("qx/static/image/blank.gif");
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getCellStyle : function(cellInfo) {
      return this.base(arguments, cellInfo) + ";padding-top:4px;";
    },


    // overridden
    _identifyImage : function(cellInfo)
    {
      var imageHints =
      {
        imageWidth  : 11,
        imageHeight : 11
      };

      switch(cellInfo.value)
      {
        case true:
          imageHints.url = this._iconUrlTrue;
          break;

        case false:
          imageHints.url = this._iconUrlFalse;
          break;

        default:
          imageHints.url = this._iconUrlNull;
          break;
      }

      return imageHints;
    }
  }
});
