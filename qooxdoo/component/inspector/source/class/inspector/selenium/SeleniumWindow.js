/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/actions/list-add.png)
#asset(qx/icon/Tango/22/actions/list-remove.png)
#asset(qx/icon/Tango/22/actions/media-playback-start.png)
#asset(qx/icon/Tango/22/actions/media-record.png)
#asset(qx/icon/Tango/22/categories/system.png)
************************************************************************ */

/**
 * This class represents the Selenium window.
 * 
 * The Selenium window recreates some of the Selenium IDE Firefox extension's
 * functionality, namely generating locator strings (in this case for qooxdoo
 * widgets instead of regular DOM elements) and running Selenium commands 
 * against the inspected application.
 */
qx.Class.define("inspector.selenium.SeleniumWindow", {

  extend : inspector.components.AbstractWindow,
  
  construct : function() {
    // call the constructor of the superclass
    this.base(arguments, "Selenium");
    
    this.__seleniumScripts = [
      "/core/scripts/xmlextras.js",
      "/core/lib/prototype.js",
      "/core/lib/cssQuery/cssQuery-p.js",
      "/core/lib/snapsie.js",
      "/core/scripts/htmlutils.js",
      "/core/scripts/ui-element.js",
      "/core/scripts/selenium-browserdetect.js",
      "/core/scripts/selenium-browserbot.js",
      "/core/scripts/find_matching_child.js",
      "/core/scripts/selenium-api.js",
      "/core/scripts/selenium-commandhandlers.js",
      "/core/scripts/selenium-executionloop.js",
      "/core/scripts/selenium-remoterunner.js",
      "/core/scripts/selenium-logging.js",
      "/core/scripts/selenium-version.js",
      "/core/xpath/util.js",
      "/core/xpath/xmltoken.js",
      "/core/xpath/dom.js",
      "/core/xpath/xpath.js",
      "/core/xpath/javascript-xpath-0.1.11.js"
    ];
    this.__availableCommands = [];
    
    // Toolbar
    var part1 = this.__getToolbarPart1();
    part1.setEnabled(false);
    this._toolbar.add(part1);
    var part2 = this.__getToolbarPart2();
    part2.setEnabled(false);
    this._toolbar.add(part2);
    this._toolbar.addSpacer();
    this._toolbar.add(this.__getToolbarPart3());
    
    // Options window
    this._optionsWindow = new inspector.selenium.OptionsWindow("Selenium Options", null, this);
    
    // Table
    this._table = this.__getTable();
    this.add(this._table, {flex: 1});
    
    // Log
    //var logLabel = new qx.ui.basic.Label()
    this._logArea = new qx.ui.form.TextArea();
    this._logArea.set({
      margin: 5
    });
    this.add(this._logArea);
    
    // Immediately load scripts if cookies are set
    var coreScripts = qx.bom.Cookie.get("coreScripts");
    var userExt = qx.bom.Cookie.get("userExt");
    if (coreScripts && userExt) {
      this.setSeleniumScripts([coreScripts, userExt]);    
    }
  },
  
  events :
  {
    "open" : "qx.event.type.Event"
  },  
  
  properties : {
    
    seleniumScripts : {
      init : null,
      apply : "_applySeleniumScripts",
      event : "changeSeleniumScripts"
    }

  },
  
  members : {
    
    __availableCommands : null,
    __selectedWidget : null,
    __selenium : null,
    __seleniumCommandQueue : null,
    __seleniumScripts : null,

    /*
    open : function()
    {
      this.base(arguments);
      this.fireEvent("open");
    },
    
    setSizeAndPosition : function(position) {
      this.moveTo(position.left, position.top);
      this.setWidth(position.width);
      this.setHeight(position.height);
    },
    */
    
    setInitSizeAndPosition: function() {
      this.moveTo(0, 35);
      this.setHeight(300);
      this.setWidth(400);
    },    
  
    select : function(widget) {
      if (widget == this.__selectedWidget) {
        return;
      }
      this.__selectedWidget = widget;
      if (this._recordButton.getValue()) {
        this.__addLocator();
      }
    },


    getSelection : function() {
      // get the selected element
      var selectedElement = this.__selectedWidget;
      // return the id if an element is selected
      if (selectedElement != null) {
        return selectedElement.getUserData("instance");
      }
      // return null otherwise
      return null;
    },
    
    /**
     * Returns a Selenium instance that can be used to run commands against the
     * inspected application.
     * 
     * @return {Object} The Selenium instance
     */
    getSelenium : function() {
      if (this.__selenium) {
        return this.__selenium;
      }
      
      var iframeWindow = qx.core.Init.getApplication().getIframeWindowObject();
      this.__selenium = window.Selenium.createForWindow(iframeWindow);
      this.setLogHook();
      //DEBUGGING ONLY:
      //window.selenium = this.__selenium;
      return this.__selenium;
    },
    
    __getToolbarPart1 : function()
    {
      var part1 = new qx.ui.toolbar.Part();
    
      // create and add the add button
      var addButton = new qx.ui.toolbar.Button(null,
          "icon/22/actions/list-add.png");
      part1.add(addButton);
      addButton.addListener("execute", this.__addLocator, this);
      addButton.setToolTipText("Add locator for inspected widget");
      
      var removeButton = new qx.ui.toolbar.Button(null,
          "icon/22/actions/list-remove.png");
      part1.add(removeButton);
      removeButton.addListener("execute", this.__removeSelectedRows, this);
      removeButton.setToolTipText("Remove selected command(s)");
      
      return part1;
    },
    
    __getToolbarPart2 : function()
    {
      var part2 = new qx.ui.toolbar.Part();
      
      this._speedSlider = new qx.ui.form.Slider();
      this._speedSlider.set({
        toolTipText : "Step speed (Selenium command execution delay)",
        minimum : 2,
        maximum : 50,
        singleStep : 1,
        pageStep : 10,
        allowGrowY : false,
        width : 50,
        marginTop : 10,
        marginLeft : 5
      });
      this._speedSlider.setValue(5);
      part2.add(this._speedSlider);
      
      var speedLabel = new qx.ui.basic.Label("");
      speedLabel.set({
        marginTop : 10,
        marginLeft : 4 
      });
      part2.add(speedLabel);
      var options = {
        converter : function(value) { return (value * 100) + " ms"; }
      };
      this._speedSlider.bind("value", speedLabel, "value", options);
      
      var runCmdButton = new qx.ui.toolbar.Button(null, "icon/22/actions/media-playback-start.png");
      part2.add(runCmdButton)
      runCmdButton.addListener("execute", this.runSeleniumCommands, this);
      runCmdButton.setToolTipText("Run selected command(s)");
      
      this._recordButton = new qx.ui.toolbar.CheckBox(null,
          "icon/22/actions/media-record.png");
      part2.add(this._recordButton);
      this._recordButton.setToolTipText("Automatically add locators for each inspected widget");
      
      return part2;
    },
    
    __getToolbarPart3 : function()
    {
      var part3 = new qx.ui.toolbar.Part();
      this._optionsButton = new qx.ui.toolbar.Button(null, "icon/22/categories/system.png");
      part3.add(this._optionsButton);
      this._optionsButton.addListener("execute", function(ev) {
        if (!this._optionsWindow.isVisible()) {
          this._optionsWindow.open();
        }
      }, this);
      
      return part3;
    },
    
    __addLocator : function()
    {
      var rowArr = ["", "", ""];
      if (this.__selectedWidget) {
        var iframeWindow = qx.core.Init.getApplication().getIframeWindowObject();
        var appRoot = iframeWindow.qx.core.Init.getApplication().getRoot();
        var locator = inspector.selenium.SeleniumUtil.getQxhLocator(this.__selectedWidget, appRoot);
        var command = "qxClick";
        rowArr = [command, locator, "", this.__availableCommands ];
      }
      this._table.getTableModel().addRows([rowArr]);
    },
    
    __removeSelectedRows : function()
    {
      var tableModel = this._table.getTableModel();
      this._table.getSelectionModel().iterateSelection(function(index) {
        tableModel.removeRows(index, 1);
      });
    },
    
    __getTable : function()
    {
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "Command", "Target", "Value" , "commands"]);
      tableModel.setColumnEditable(0, true);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);

      // cell editor factory function
      // returns a cellEditorFactory instance based on data in the row itself
      var cellEditorFactoryFunc = function (cellInfo)
      {
        var table = cellInfo.table;
        var tableModel = table.getTableModel();
        var rowData = tableModel.getRowData(cellInfo.row);
        var commands = rowData[3];
        var cellEditor = new qx.ui.table.celleditor.ComboBox();
        cellEditor.setListData(commands);
        return cellEditor;
      }

      // create a "meta" cell editor object
      var cellEditorFactory = new qx.ui.table.celleditor.Dynamic(cellEditorFactoryFunc);
      
      var customColumnModel =
      {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };
      
      var table = new qx.ui.table.Table(tableModel, customColumnModel);
      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
      table.setDecorator(null);
      
      var tcm = table.getTableColumnModel();
      tcm.setColumnVisible(3, false);
      tcm.setCellEditorFactory(0, cellEditorFactory);
      
      var resizeBehavior = tcm.getBehavior();
      resizeBehavior.setWidth(0, "20%");
      resizeBehavior.setWidth(1, "50%");
      resizeBehavior.setWidth(2, "30%");
      
      return table;
    },
    
    runSeleniumCommands : function(ev)
    {
      var selectedRowData = [];
      var tableModel = this._table.getTableModel();
      this._table.getSelectionModel().iterateSelection(function(index) {
        selectedRowData.push(tableModel.getRowData(index));
      });
      
      this.__seleniumCommandQueue = selectedRowData;
      this.__runSeleniumCommand();
    },
    
    __runSeleniumCommand : function()
    {
      if (this.__seleniumCommandQueue.length == 0) {
        return;
      }
      
      var commandData = this.__seleniumCommandQueue.shift();
      var command = commandData[0];
      var locator = commandData[1];
      var value = commandData[2];
      var selenium = this.getSelenium();
      command = "do" + command.replace(/^.{1}/, command[0].toUpperCase());
      try {
        selenium[command](locator, value);
      }
      catch(ex) {
        // Use Selenium's logger 
        window.LOG.error(ex.message);
      }
      
      var stepSpeed = this._speedSlider.getValue() * 100;
      qx.event.Timer.once(this.__runSeleniumCommand, this, stepSpeed);
      
    },
    
    /**
     * Returns a list of commands supported by the currently used Selenium 
     * instance.
     * 
     * @return {Array} List of commands (method names)
     */
    getAvailableCommands : function()
    {
      var commands = [];
      var selenium = this.getSelenium();
      for (var prop in selenium) {
        if (typeof selenium[prop] == "function" && prop.indexOf("do") == 0) {
          //convert to names used in Selenium API, e.g. doSomeThing -> someThing
          var command = prop.substr(2);
          command = command.replace(/^.{1}/, command[0].toLowerCase())
          commands.push(command);
        }
      }
      commands.sort();
      return commands;
    },
    
    setLogHook : function()
    {
      if (!window.Logger) {
        this.warn("Selenium Logger not ready!");
        return;
      }
      var self = this;
      window.Logger.prototype.logHook = function(logLevel, message)
      {
        var oldValue = self._logArea.getValue();
        var newValue = oldValue ? oldValue + "\n" + message : message;
        self._logArea.setValue(newValue);
      };
    },
    
    _applySeleniumScripts : function(value, old)
    {
      if (value == old) {
        return;
      }
      
      this._toolbar.getChildren()[0].setEnabled(false);
      this._toolbar.getChildren()[1].setEnabled(false);
      
      if (window.Selenium) {
        window.Selenium = null;
      }
      
      var seleniumCore = value[0];
      var userExt = value[1];
      
      // strip trailing slash
      if (seleniumCore.substr(seleniumCore.length - 1) == "/") {
        seleniumCore = seleniumCore.substr(0, seleniumCore.length - 1);
      }
      
      var loader = new inspector.selenium.QueuedScriptLoader();
      loader.addListenerOnce("finished", function(ev) {
        if (ev.getData().fail > 0) {
          alert("Couldn't load Selenium Core scripts, make sure the path is correct!");
          return;
        }
        loader.addListenerOnce("finished", this.__scriptsLoaded, this);
        loader.load([userExt]);
      }, this);
      
      var coreQueue = [];
      for (var i=0,l=this.__seleniumScripts.length; i<l; i++) {
        coreQueue.push(seleniumCore + this.__seleniumScripts[i]);
      }
      loader.load(coreQueue);
    },
    
    
    __scriptsLoaded : function(ev)
    {
      if (ev.getData().fail > 0 ) {
        alert("Couldn't load qooxdoo Selenium user extensions, make sure the path is correct!");
        return;
      }
      
      if (!window.Selenium) {
        alert("Unexpected error: Selenium instance not created!");
        return;
      }
      
      qx.bom.Cookie.set("coreScripts", this.getSeleniumScripts()[0], 365);
      qx.bom.Cookie.set("userExt", this.getSeleniumScripts()[1], 365);
      this._toolbar.getChildren()[0].setEnabled(true);
      this._toolbar.getChildren()[1].setEnabled(true);
      this.__availableCommands = this.getAvailableCommands();
    }
  
  },  

  destruct : function()
  {
    this.__selenium = null;
    window.selenium = null;
    window.LOG = null;
    this._disposeObjects("_toolbar", "_recordButton", "_speedSlider", "_optionsButton", "_optionsWindow", "_table", "_logArea");
  }
});
