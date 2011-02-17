/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.tree.VirtualTree",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    tree : null,


    setUp : function()
    {
      this.base(arguments);

      this.tree = new qx.ui.tree.VirtualTree();
      this.getRoot().add(this.tree);

      this.flush();
    },


    tearDown : function()
    {
      this.base(arguments);

      this.tree.dispose();
      this.tree = null;
    },


    createModel : function()
    {
      var root = {
        name: "Root node",
        children: []
      };

      for (var i = 0; i < 10; i++)
      {
        var children = [];

        for (var k = 0; k < 10; k++)
        {
          children.push({
            name: "Leaf " + i + "." + k
          });
        }

        root.children.push({
          name: "Node " + i,
          children: children
        });
      }

      return root;
    },


    testCreation : function()
    {
      this.assertEquals("virtual-tree", this.tree.getAppearance(), "Init value for 'appearance' is wrong!");
      this.assertTrue(this.tree.getFocusable(), "Init value for 'focusable' is wrong!");
      this.assertEquals("dblclick", this.tree.getOpenMode(), "Init value for 'openMode' is wrong!");
      this.assertFalse(this.tree.getHideRoot(), "Init value for 'hideRoot' is wrong!");
      this.assertFalse(this.tree.getRootOpenClose(), "Init value for 'rootOpenClose' is wrong!");
      
      var model = this.tree.getModel();
      this.assertEquals("", model.name, "Init value for 'model' is wrong!");
      this.assertArrayEquals([], model.children, "Init value for 'model' is wrong!");
    },


    testSetModel : function() {
      var model = this.createModel();
      this.tree.setModel(model);

      this.assertEquals(model, this.tree.getModel());
    },


    testResetModel : function() {
      var oldModel = this.tree.getModel();

      var model = this.createModel();
      this.tree.setModel(model);

      this.tree.resetModel();
      this.assertEquals(oldModel, this.tree.getModel());
    },
    

    testBuildLookupTable : function() {
      var model = this.createModel();
      this.tree.setModel(model);
      
      var expected = [];
      var root = model;
      expected.push(root);

      for (var i = 0; i < root.children.length; i++) {
        expected.push(root.children[i]);
      }

      this.assertArrayEquals(expected, this.tree.getLookupTable());
      this.assertEquals(expected.length, this.tree.getPane().getRowConfig().getItemCount());
    }
  }
});