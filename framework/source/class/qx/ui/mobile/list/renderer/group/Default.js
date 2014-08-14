"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The default group renderer. Used as the default renderer by the
 * {@link qx.ui.mobile.list.provider.Provider}. Configure the renderer
 * by setting the {@link qx.ui.mobile.list.List#delegate} property.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // Create the list with a delegate that
 *   // configures the list item.
 *   var list = new qx.ui.mobile.list.List({
 *     configureItem: function(item, data, row)
 *     {
 *       item.setImage("path/to/image.png");
 *       item.setTitle(data.title);
 *       item.setSubtitle(data.subtitle);
 *     },
 *
 *     configureGroupItem: function(item, data, group) {
 *       item.setTitle(group + " " + data.title);
 *     },
 *
 *     group: function(data, row) {
 *      return {
 *       title: row < 4 ? "Selectable" : "Unselectable"
 *     };
 *    }
 *  });
 * </pre>
 *
 * This example creates a list with a delegate that configures the list items and groups with
 * the given data.
 */

qx.Bootstrap.define("qx.ui.mobile.list.renderer.group.Default",
{
  extend : qx.ui.mobile.list.renderer.group.Abstract,


  construct : function(layout)
  {
    if (!layout) {
      layout = new qx.ui.mobile.layout.HBox();
    }
    layout.alignY = "middle";
    this.base(qx.ui.mobile.list.renderer.group.Abstract, "constructor", layout);
    this._init();
  },


  members :
  {
    __image : null,
    __title : null,
    __rightContainer : null,


    /**
     * Returns the image widget which is used for this renderer.
     *
     * @return {qx.ui.mobile.basic.Image} The image widget
     */
    getImageWidget : function() {
      return this.__image;
    },


    /**
     * Returns the title widget which is used for this renderer.
     *
     * @return {qx.ui.mobile.basic.Label} The title widget
     */
    getTitleWidget : function() {
      return this.__title;
    },


    /**
     * Sets the source of the image widget.
     *
     * @param source {String} The source to set
     */
    setImage : function(source)
    {
      this.__image.source = source;
    },


    /**
     * Sets the value of the title widget.
     *
     * @param title {String} The value to set
     */
    setTitle : function(title)
    {
      if (title && title.translate) {
        this.__title.value = title.translate();
      }
      else {
        this.__title.value = title;
      }
    },


    /**
     * Setter for the data attribute <code></code>
     * @param groupTitle {String} the title of the group
     */
    setGroup: function(groupTitle) {
      this._setAttribute("data-group", groupTitle);
    },


    /**
     * Inits the widgets for the renderer.
     *
     */
    _init : function()
    {
      this.__image = this._createImage();
      this.append(this.__image);

      this.__rightContainer = this._createRightContainer();
      this.__rightContainer.layoutPrefs = {flex:1};
      this.append(this.__rightContainer);

      this.__title = this._createTitle();
      this.__rightContainer.append(this.__title);
    },


    /**
     * Creates and returns the right container composite. Override this to adapt the widget code.
     *
     * @return {qx.ui.mobile.container.Composite} the right container.
     */
    _createRightContainer : function() {
      return new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
    },


    /**
     * Creates and returns the image widget. Override this to adapt the widget code.
     *
     * @return {qx.ui.mobile.basic.Image} the image widget.
     */
    _createImage : function() {
      var image = new qx.ui.mobile.basic.Image();
      image.anonymous = true;
      image.addClass("group-item-image");
      return image;
    },


    /**
     * Creates and returns the title widget. Override this to adapt the widget code.
     *
     * @return {qx.ui.mobile.basic.Label} the title widget.
     */
    _createTitle : function() {
      var title = new qx.ui.mobile.basic.Label();
      title.textWrap = false;
      title.addClass("group-item-title");
      return title;
    },


    // overridden
    reset : function()
    {
      this.__image.source = null;
      this.__title.value = "";
    },


    dispose : function() {
      this.base(qx.ui.mobile.list.renderer.group.Abstract, "dispose");
      this._disposeObjects("__image", "__title", "__rightContainer");
    }
  }
});
