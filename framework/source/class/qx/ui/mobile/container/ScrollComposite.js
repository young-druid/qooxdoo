/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * @deprecated {4.0} Please use {@link qx.ui.mobile.container.Scroll} instead.
 *
 * The ScrollComposite is a extension of {@link qx.ui.mobile.container.Composite},
 * and makes it possible to scroll vertically, if content size is greater than
 * scrollComposite's size.
 *
 * Every widget will be added to child's composite.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create the composite
 *   var scrollComposite = new qx.ui.mobile.container.ScrollComposite();
 *
 *   scrollComposite.setLayout(new qx.ui.mobile.layout.HBox());
 *
 *   // add some children
 *   scrollComposite.add(new qx.ui.mobile.basic.Label("Name: "), {flex:1});
 *   scrollComposite.add(new qx.ui.mobile.form.TextField());
 * </pre>
 *
 * This example horizontally groups a label and text field by using a
 * Composite configured with a horizontal box layout as a container.
 */
qx.Class.define("qx.ui.mobile.container.ScrollComposite",
{
  extend : qx.ui.mobile.container.Composite,


  /**
   * @param layout {qx.ui.mobile.layout.Abstract?null} The layout that should be used for this
   *     container
   */
  construct : function(layout)
  {
    this.base(arguments);

    if (qx.core.Environment.get("qx.debug"))
    {
      qx.log.Logger.deprecatedClassWarning(arguments.callee, "The class 'qx.ui.mobile.container.ScrollComposite' is deprecated. Please use 'qx.ui.mobile.container.Scroll' instead");
    }

    this.__lastOffset = [0,0];
    this.__currentOffset = [0,0];

    this._scrollContainer = this._createScrollContainer();

    this.addListener("trackstart", this._onTrackStart, this);
    this.addListener("track", this._onTrack, this);
    this.addListener("swipe", this._onSwipe, this);

    this._setLayout(new qx.ui.mobile.layout.HBox());
    this._add(this._scrollContainer, {flex:1});

    this._updateScrollIndicator(this.__lastOffset[1]);

    this.initHeight();
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "scroll-container"
    },

    /** Flag if scrolling in horizontal direction should be allowed. */
    scrollableX :
    {
      init : false,
      check : "Boolean"
    },

    /** Flag if scrolling in vertical direction should be allowed. */
    scrollableY :
    {
      init : true,
      check : "Boolean"
    },

    /** Controls whether are visual indicator is used, when the scrollComposite is
     * scrollable to top or bottom direction. */
    showScrollIndicator :
    {
      init : true,
      check : "Boolean",
      apply : "_updateScrollIndicator"
    },


    /**
    * This flag controls whether this widget has a fixed height
    * or grows till the property value of <code>height</code> has reached.
    */
    fixedHeight :
    {
      init : false,
      check : "Boolean",
      apply : "_applyFixedHeight"
    },


    /**
     * The height of this widget.
     * Allowed values are length or percentage values according to <a src="https://developer.mozilla.org/en-US/docs/CSS/height" target="_blank">CSS height syntax</a>.
     */
    height :
    {
      init : "10rem",
      check : "String",
      nullable : true,
      apply : "_applyHeight"
    }
  },


  members :
  {
    _scrollContainer : null,
    __lastOffset : null,
    __currentOffset : null,
    __isVerticalScroll : null,
    __onTouch : null,
    __distanceX : null,
    __distanceY : null,



    /**
     * Getter for the inner scrollContainer of this scrollComposite.
     * @return {qx.ui.mobile.container.Composite} a composite which represents the scrollContainer.
     */
    getScrollContainer : function() {
      return this._scrollContainer;
    },


    /**
     * Factory method for the scrollContainer.
     * @return {qx.ui.mobile.container.Composite} a composite which represents the scrollContainer.
     */
    _createScrollContainer : function() {
      var scrollContainer = new qx.ui.mobile.container.Composite();
      scrollContainer.setTransformUnit("px");
      scrollContainer.addCssClass("scroll-container-child");
      return scrollContainer;
    },


    /**
    * Handler for <code>trackstart</code> events on scrollContainer
    * @param evt {qx.event.type.Track} The trackstart event.
    */
    _onTrackStart : function(evt){
      this.__onTouch = true;
      this.__isVerticalScroll = (this.getScrollableX() && this.getScrollableY()) ? null : this.getScrollableY();
      this._applyNoEasing();
    },


    /**
     * Handler for <code>track</code> events on scrollContainer
     * @param evt {qx.event.type.Pointer} The pointer event.
     */
    _onTrack : function(evt) {
      if (this.__isVerticalScroll === null) {
        this.__isVerticalScroll = (evt.getDelta().axis == "y");
      }

      this.__distanceX = evt.getDelta().x;
      this.__distanceY = evt.getDelta().y;

      if (this.isScrollableX()) {
        if (Math.abs(this.__distanceY) < 3 || !this.isScrollableY() || !this.__isVerticalScroll) {
          this.__distanceY = 0;
        }

        this.__currentOffset[0] = Math.floor(this.__lastOffset[0] + this.__distanceX);
        this._scrollContainer.setTranslateX(this.__currentOffset[0]);
      }

      if (this.isScrollableY()) {
        if (Math.abs(this.__distanceX) < 3 || !this.isScrollableX() || this.__isVerticalScroll) {
          this.__distanceX = 0;
        }

        this.__currentOffset[1] = Math.floor(this.__lastOffset[1] + this.__distanceY);
        this._scrollContainer.setTranslateY(this.__currentOffset[1]);

        this._updateScrollIndicator(this.__currentOffset[1]);
      }
    },


    /**
     * Updates the visibility of the vertical scroll indicator (top or bottom).
     * @param positionY {Integer} current offset of the scrollContainer.
     */
    _updateScrollIndicator : function(positionY) {
      var targetElement =  this._scrollContainer.getContainerElement();
      var needsScrolling = targetElement.scrollHeight > targetElement.offsetHeight;

      if(this.isScrollableY() && this.isShowScrollIndicator() && needsScrolling) {
        var lowerLimit = targetElement.scrollHeight - targetElement.offsetHeight - 4;

        // Upper Limit Y
        if(positionY >= 0) {
          this.removeCssClass("scrollable-top");
        } else {
          this.addCssClass("scrollable-top");
        }

        // Lower Limit Y
        if(positionY < -lowerLimit) {
          this.removeCssClass("scrollable-bottom");
        } else {
          this.addCssClass("scrollable-bottom");
        }
      } else {
        this.removeCssClass("scrollable-top");
        this.removeCssClass("scrollable-bottom");
      }
    },


    /**
     * Swipe handler for scrollContainer.
     * @param evt {qx.event.type.Swipe} The swipe event.
     */
    _onSwipe: function(evt) {
      if (!evt.isPrimary()) {
        return;
      }

      if (this.isScrollableY() && this.__isVerticalScroll) {
        var scrollLimit = this._calcScrollLimit();

        this.__onTouch = false;
        this._scrollStep(this.__currentOffset[1], evt.getVelocity(), 1, scrollLimit);
      } else if (this.isScrollableX() && !this.__isVerticalScroll) {
        this.scrollTo(this.__currentOffset[0], this.__currentOffset[1]);
      }
    },


    /**
    * Enables the momentum scrolling. This method will be called recursively,
    * and divides the scroll velocity on every step by the parameter momentum.
    * @param startPosition {Number} the last known position of the scroll area.
    * @param velocity {Number} the current scroll velocity.
    * @param momentum {Number} the momentum factor.
    * @param scrollLimit {Number} scrollLimit of the scroll area.
    */
    _scrollStep: function(startPosition, velocity, momentum, scrollLimit) {
      var nextPosition = startPosition + velocity * 10;

      this._scrollContainer.setTranslateY(nextPosition);
      this.__lastOffset[1] = nextPosition;
      this._updateScrollIndicator(this.__lastOffset[1]);

      if (Math.abs(velocity) > 0.01 && !this.__onTouch) {
        if (nextPosition > 0) {
          momentum = momentum + Math.abs(nextPosition) / 10000;
        } else if (nextPosition < -scrollLimit[1]) {
          momentum = momentum + Math.abs(scrollLimit[1] + nextPosition) / 10000;
        } else {
          momentum = momentum + 0.00005;
        }
        var nextVelocity = (velocity / momentum);
        qx.bom.AnimationFrame.request(function() {
          this._scrollStep(nextPosition, nextVelocity, momentum, scrollLimit);
        }, this);
      } else {
        this.scrollTo(0, nextPosition);
      }
    },


    /**
     * Scrolls the scrollContainer to the given position,
     * depending on the state of properties scrollableX and scrollableY.
     * @param positionX {Integer} target offset x
     * @param positionY {Integer} target offset y
     */
    scrollTo : function(positionX, positionY) {
      positionX = Math.floor(positionX);
      positionY = Math.floor(positionY);

      var scrollLimit = this._calcScrollLimit();

      var oldY = this._scrollContainer.getTranslateY();

      // Upper Limit Y
      if (positionY >= 0) {
        if (oldY < 0) {
          this._applyScrollBounceEasing();
        } else {
          this._applyBounceEasing();
        }

        positionY = 0;
      }

      // Lower Limit Y
      if (positionY < -scrollLimit[1]) {
        if (oldY > -scrollLimit[1]) {
          this._applyScrollBounceEasing();
        } else {
          this._applyBounceEasing();
        }

        positionY = -scrollLimit[1];
      }
      if (!this.__isVerticalScroll) {
        // Left Limit X
        if (positionX >= 0) {
          this._applyBounceEasing();
          positionX = 0;
        }
        // Right Limit X
        if (positionX < -scrollLimit[0]) {
          this._applyBounceEasing();
          positionX = -scrollLimit[0];
        }
      }

      if (this.isScrollableX()) {
        this._scrollContainer.setTranslateX(positionX);
        this.__lastOffset[0] = positionX;
      }
      if (this.isScrollableY()) {
        this._scrollContainer.setTranslateY(positionY);
        this.__lastOffset[1] = positionY;
      }
      this._updateScrollIndicator(this.__lastOffset[1]);
    },


    /**
    * Calculates the lower scroll limit of the scroll container.
    * @return {Array} an array with scroll limits: [x,y]
    */
    _calcScrollLimit : function() {
      var targetElement = this._scrollContainer.getContainerElement();
      var lowerLimitY = targetElement.scrollHeight - this.getContentElement().clientHeight;
      var lowerLimitX = targetElement.scrollWidth - targetElement.offsetWidth - 4;
      return [lowerLimitX,lowerLimitY];
    },


    //overridden
    add : function(child, options) {
      this._scrollContainer.add(child,options);
      this._handleSize(child);
    },


    // overridden
    addAfter : function(child, after, layoutProperties) {
      this._scrollContainer.addAfter(child, after, layoutProperties);
      this._handleSize(child);
    },


    // overridden
    addAt : function(child, index, options) {
      this._scrollContainer.addAt(child, index, options);
      this._handleSize(child);
    },


    // overridden
    addBefore : function(child, before, layoutProperties) {
      this._scrollContainer.addBefore(child, before, layoutProperties);
      this._handleSize(child);
    },


    // overridden
    getChildren : function() {
      return this._scrollContainer.getChildren();
    },


    // overridden
    getLayout : function() {
      return this._scrollContainer.getLayout();
    },


     // overridden
    setLayout : function(layout) {
      this._scrollContainer.setLayout(layout);
    },


    // overridden
    hasChildren : function() {
      return this._scrollContainer.getLayout();
    },


    indexOf : function(child) {
      this._scrollContainer.indexOf(child);
    },


    // overridden
    remove : function(child) {
      this._unhandleSize(child);
      this._scrollContainer.remove(child);
    },


    // overridden
    removeAll : function() {
      var children = this.getChildren();
      for(var i = 0; i < children.length; i++) {
        this._unhandleSize(children[i]);
      }

      this._scrollContainer.removeAll();
    },


    // overridden
    removeAt : function(index) {
      var children = this.getChildren();
      this._unhandleSize(children[index]);
      this._scrollContainer.removeAt(index);
    },


    // Property apply
    _applyFixedHeight : function(value, old) {
      this._applyHeight(this.getHeight());
    },


    // Property apply
    _applyHeight : function(value, old) {
      var cssProperty = "maxHeight";
      if (this.getFixedHeight() === true) {
        cssProperty = "height";
      }
      qx.bom.element.Style.set(this.getContainerElement(), cssProperty, this.getHeight());
    },


    /**
     * Deactivates any scroll easing for the scrollContainer.
     */
    _applyNoEasing : function() {
      this._scrollContainer.removeCssClass("momentum-ease");
      this._scrollContainer.removeCssClass("bounce-ease");
      this._scrollContainer.removeCssClass("scroll-bounce-ease");
    },


    /**
     * Activates momentum scrolling for the scrollContainer.
     * Appears like a "ease-out" easing function.
     */
    _applyMomentumEasing : function() {
      this._applyNoEasing();
      this._scrollContainer.addCssClass("momentum-ease");
    },


    /**
     * Activates bounce easing for the scrollContainer.
     * Used when user drags the scrollContainer over the edge manually.
     */
    _applyBounceEasing : function() {
      this._applyNoEasing();
      this._scrollContainer.addCssClass("bounce-ease");
    },


    /**
     * Activates the scroll bounce easing for the scrollContainer.
     * Used when momentum scrolling is activated and the momentum calculates an
     * endpoint outside of the viewport.
     * Causes the effect that scrollContainers scrolls to far and bounces back to right position.
     */
    _applyScrollBounceEasing : function() {
      this._applyNoEasing();
      this._scrollContainer.addCssClass("scroll-bounce-ease");
    },


    /**
     * Checks if size handling is needed:
     * if true, it adds all listener which are needed for synchronizing the scrollHeight to
     * elements height.
     * @param child {qx.ui.mobile.core.Widget} target child widget.
     */
    _handleSize : function(child) {
      // If item is a text area, then it needs a special treatment.
      // Install listener to the textArea for syncing the scrollHeight to
      // textAreas height.
      if(child instanceof qx.ui.mobile.form.TextArea) {
        child.addListener("appear", this._fixChildElementsHeight, child);
        child.addListener("input", this._fixChildElementsHeight, child);
        child.addListener("changeValue", this._fixChildElementsHeight, child);
      }
    },


    /**
     * Removes Listeners from a child if necessary.
     * @param child {qx.ui.mobile.core.Widget} target child widget.
     */
    _unhandleSize : function(child) {
      // If item is a text area, then it needs a special treatment.
      // Install listener to the textArea for syncing the scrollHeight to
      // textAreas height.
      if(child instanceof qx.ui.mobile.form.TextArea) {
        child.removeListener("appear", this._fixChildElementsHeight, child);
        child.removeListener("input", this._fixChildElementsHeight, child);
        child.removeListener("changeValue", this._fixChildElementsHeight, child);
      }
    },


    /**
     * Synchronizes the elements.scrollHeight and its height.
     * Needed for making textArea scrollable.
     * @param evt {qx.event.type.Data} a custom event.
     */
    _fixChildElementsHeight : function(evt) {
      this.getContainerElement().style.height = 'auto';
      this.getContainerElement().style.height = this.getContainerElement().scrollHeight+'px';
    }
  },


  destruct : function()
  {
    this.removeListener("trackstart",this._onTrackStart,this);
    this.removeListener("track",this._onTrack,this);
    this.removeListener("swipe",this._onSwipe,this);

    var children = this.getChildren();
    for(var i = 0; i < children.length; i++) {
      this._unhandleSize(children[i]);
    }

    this._disposeObjects("_scrollContainer");

    this.__isVerticalScroll = null;
  }
});
