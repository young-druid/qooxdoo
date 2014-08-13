/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

qx.Class.define("qx.test.mobile.dialog.Menu",
{
  extend : qx.test.mobile.MobileTestCase,
  include : [qx.dev.unit.MMock],

  construct: function() {
    this.initMMock();
  },

  members :
  {
    testInit : function()
    {
      // SMOKE TEST for menu.
      var model = new qx.data.Array(["item1","item2","item3"]);
      var model2 = new qx.data.Array(["item4","item5","item6"]);

      var menu = new qx.ui.mobile.dialog.Menu(model);
      menu.selectedIndex = 2;

      menu.setItems(model2);
      menu.selectedIndex = 1;

      menu.dispose();
    },


    testSetListHeight : function()
    {
      var model = new qx.data.Array(["item1","item2","item3"]);

      var menu = new qx.ui.mobile.dialog.Menu(model);

      var visibleItems = 2;

      menu.visibleListItems = visibleItems;
      menu.show();

      var expected = menu.getSelectionList().getListItemHeight() * visibleItems;

      var listHeight = qx.bom.element.Style.get(menu._getListScroller().getContentElement(),"height");

      listHeight = Math.floor(parseFloat(listHeight,10) * 100);
      expected = Math.floor(expected * 100);

      this.assertEquals(listHeight, expected);

      menu.dispose();
    },


    testMaxListHeight : function() {
      var stub = this.stub(qx.bom.element.Dimension, "getHeight", function() {
        return 500;
      });

      var model = new qx.data.Array(["item1", "item2", "item3", "item1", "item2", "item3",
        "item1", "item2", "item3", "item1", "item2", "item3", "item2", "item3", "item2", "item3",  "item1", "item2", "item3",  "item1", "item2", "item3"
      ]);

      var menu = new qx.ui.mobile.dialog.Menu(model);

      menu.visibleListItems = 1000;
      menu.show();

      var parentHeight =  qx.ui.mobile.dialog.Popup.ROOT.getHeight();
      parentHeight = parseInt(parentHeight, 10);
      parentHeight = parentHeight * 0.75;

      var expectedListHeight = parseInt(parentHeight, 10);

      var listHeight = qx.bom.element.Style.get(menu._getListScroller().getContentElement(), "height");
      listHeight = parseInt(listHeight, 10);

      this.assertEquals(expectedListHeight,listHeight);

      menu.dispose();
      stub.restore();
    }
  }

});
