/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

/**
 * Implements the dynamic behaviour of the API viewer.
 * The GUI is defined in {@link Viewer}.
 */
qx.Class.define("apiviewer.Controller",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param widgetRegistry {Viewer} the GUI
   */
  construct : function(widgetRegistry)
  {
    this._widgetRegistry = widgetRegistry;

    this._titlePrefix = qx.core.Setting.get("apiviewer.title") + " API Documentation";
    document.title = this._titlePrefix;

    this._detailLoader = this._widgetRegistry.getWidgetById("detail_loader");
    this._packageViewer = this._widgetRegistry.getWidgetById("package_viewer");

    this._classViewer = this._widgetRegistry.getWidgetById("class_viewer");
    this.__bindClassViewer();

    this._tree = this._widgetRegistry.getWidgetById("tree");
    this.__bindTree();

    this.__bindToolbar();

    this._history = qx.client.History.getInstance();
    this.__bindHistory();
  },


  members :
  {

    /**
     * Loads the API doc tree from a URL. The URL must point to a JSON encoded
     * doc tree.
     *
     * @type member
     * @param url {String} the URL.
     */
    load : function(url)
    {
      var req = new qx.io.remote.Request(url);

      req.setTimeout(180000);

      req.addEventListener("completed", function(evt)
      {
        var loadEnd = new Date();
        this.debug("Time to load data from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");

        var content = evt.getData().getContent();

        var start = new Date();
        var treeData = eval("(" + content + ")");
        var end = new Date();
        this.debug("Time to eval tree data: " + (end.getTime() - start.getTime()) + "ms");

        // give the browser a chance to update its UI before doing more
        qx.client.Timer.once(function() {
          this.__setDocTree(treeData);

          // Handle bookmarks
          var state = this._history.getState();
          if (state)
          {
            qx.client.Timer.once(function() {
              this.__selectItem(state);
            }, this, 0);
          }

          this._detailLoader.setHtml(
            '<h1><div class="please">' +
            qx.core.Setting.get("apiviewer.title") +
            '</div>API Documentation</h1>'
          );

        }, this, 0);
      }, this);

      req.addEventListener("failed", function(evt) {
        this.error("Couldn't load file: " + url);
      }, this);

      var loadStart = new Date();
      req.send();
    },


    /**
     * binds the events of the class viewer
     */
    __bindClassViewer : function()
    {
      this._classViewer.addEventListener("classLinkClicked", function(e) {
        try
        {
          this.__selectItem(e.getData());
        }
        catch(exc)
        {
          this.error("Selecting item '" + e.getData() + "' failed", exc);
        }
      }, this);
    },


    /**
     * binds the selection event of the package tree.
     */
    __bindTree : function()
    {
      this._tree.getManager().addEventListener("changeSelection", function(evt) {
        var treeNode = evt.getData()[0];
        if (treeNode && treeNode.docNode)
        {
          this.__updateHistory(treeNode.docNode.getFullName());
          this.__selectClass(treeNode.docNode);
        }
      }, this);

    },


    /**
     * binds the actions of the toolbar buttons.
     */
    __bindToolbar : function()
    {
      var btn_inherited = this._widgetRegistry.getWidgetById("btn_inherited");
      btn_inherited.addEventListener("changeChecked", function(e) {
        this._classViewer.setShowInherited(e.getData());
      }, this);

      var btn_protected = this._widgetRegistry.getWidgetById("btn_protected");
      btn_protected.addEventListener("changeChecked", function(e) {
        this._classViewer.setShowProtected(e.getData());
      }, this);

      var btn_private = this._widgetRegistry.getWidgetById("btn_private");
      btn_private.addEventListener("changeChecked", function(e) {
        this._classViewer.setShowPrivate(e.getData());
      }, this);
    },


    /**
     * bind history events
     */
    __bindHistory : function()
    {
      this._history.addEventListener("request", function(evt) {
        this._tree.selectTreeNodeByClassName(evt.getData())
      }, this);
    },


    /**
     * Loads the documentation tree.
     *
     * @param docTree {apiviewer.dao.Package} root node of the documentation tree
     */
    __setDocTree : function(docTree)
    {
      var start = new Date();
      var rootPackage = new apiviewer.dao.Package(docTree);
      var end = new Date();
      this.debug("Time to build data tree: " + (end.getTime() - start.getTime()) + "ms");

      var start = new Date();
      this._tree.setTreeData(rootPackage);
      var end = new Date();
      this.debug("Time to update tree: " + (end.getTime() - start.getTime()) + "ms");

      return true;
    },


    /**
     * Push the class to the browser history
     *
     * @param className {String} name of the class
     */
    __updateHistory : function(className)
    {
      var newTitle = this._titlePrefix + " - class " + className;
      qx.client.History.getInstance().addToHistory(className, newTitle);
    },


    /**
     * Display information about a class
     *
     * @type member
     * @param classNode {apiviewer.dao.Class} class node to display
     */
    __selectClass : function(classNode)
    {
      this._detailLoader.setVisibility(false);

      if (classNode instanceof apiviewer.dao.Class)
      {
        this._packageViewer.setVisibility(false);
        this._classViewer.setClassNode(classNode);
        this._classViewer.setVisibility(true);
      }
      else
      {
        this._classViewer.setVisibility(false);
        this._packageViewer.showInfo(classNode);
        this._packageViewer.setVisibility(true);
      }
    },


    /**
     * Selects an item (class, property, method or constant).
     *
     * @type member
     * @param fullItemName {String} the full name of the item to select.
     *          (e.g. "qx.mypackage.MyClass" or "qx.mypackage.MyClass#myProperty")
     */
    __selectItem : function(fullItemName)
    {
      var className = fullItemName;
      var itemName = null;
      var hashPos = fullItemName.indexOf("#");

      if (hashPos != -1)
      {
        className = fullItemName.substring(0, hashPos);
        itemName = fullItemName.substring(hashPos + 1);

        var parenPos = itemName.indexOf("(");

        if (parenPos != -1) {
          itemName = qx.lang.String.trim(itemName.substring(0, parenPos));
        }
      }

      this._tree.selectTreeNodeByClassName(className);

      if (itemName) {
        this._classViewer.showItem(itemName);
      }
    }

  }

});
