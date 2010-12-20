/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.AutoSizeTextArea",
{
  extend : qx.application.Standalone,


  construct : function()
  {
    this.base(arguments);
  },

  members :
  {
    main : function()
    {
      this.base(arguments);

      var container = new qx.ui.container.Composite(new qx.ui.layout.Grid(10,10));
      this.getRoot().add(container, {top: 20, left: 20});

      // First block

      var label = new qx.ui.basic.Label();
      label.setValue("Regular");
      var textArea = new qx.ui.form.TextArea();
      textArea.set({
        allowStretchY: false
      });
      container.add(label, {row: 0, column: 0});
      container.add(textArea, {row: 1, column: 0});

      var label = new qx.ui.basic.Label();
      label.setValue("Auto-Size");
      var textAreaAuto = new qx.ui.form.TextArea();
      textAreaAuto.set({
        allowStretchY: false,
        autoSize: true
      });
      container.add(label, {row: 0, column: 1});
      container.add(textAreaAuto, {row: 1, column: 1});

      var label = new qx.ui.basic.Label();
      label.setValue("Auto-Size (wrap-handling)");
      var textAreaWrap = new qx.ui.form.TextArea();
      textAreaWrap.set({
        allowStretchY: false,
        autoSize: true,
        wrap: false,
        value: this.__getLongValue()
      });
      var button = new qx.ui.form.ToggleButton("Wrap");
      button.setAllowStretchX(false);
      button.addListener("changeValue", function() {
        textAreaWrap.toggleWrap();
      });
      container.add(label, {row: 0, column: 2});
      container.add(textAreaWrap, {row: 1, column: 2});
      container.add(button, {row: 2, column: 2});

      // Second block

      var label = new qx.ui.basic.Label();
      label.setValue("Auto-Size (minimal height)");
      var textAreaMin = new qx.ui.form.TextArea();
      textAreaMin.set({
        allowStretchY: false,
        autoSize: true,
        minHeight: 200
      });
      container.add(label, {row: 3, column: 0});
      container.add(textAreaMin, {row: 4, column: 0});

      var label = new qx.ui.basic.Label();
      label.setValue("Auto-Size (maximal height)");
      var textAreaMax = new qx.ui.form.TextArea();
      textAreaMax.set({
        allowStretchY: false,
        autoSize: true,
        minHeight: 200,
        maxHeight: 300
      });
      container.add(label, {row: 3, column: 1});
      container.add(textAreaMax, {row: 4, column: 1});

      var label = new qx.ui.basic.Label();
      label.setValue("Non-default minimal line height");
      var textAreaSmall = new qx.ui.form.TextArea();
      textAreaSmall.set({
        allowStretchY: false,
        autoSize: true,
        minimalLineHeight: 1,
        maxHeight : 300
      });
      container.add(label, {row: 3, column: 2});
      container.add(textAreaSmall, {row: 4, column: 2});

    },

    __getLongValue: function() {
      var val = new qx.type.Array(200);
      for(var i=0; i < val.length; i++) {
        val[i] = "A";
      }
      return val.join("");
    }
  }
});