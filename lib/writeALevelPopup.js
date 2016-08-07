function setWriteALevelPopup(id, formid, onEnter) {

    try {
        dialog = $( "#" + formid ).dialog({
          autoOpen: false,
          height: 300,
          width: 550,
          modal: true,
          position: {
               my: "center",
               at: "center",
               of: window
            },
          buttons: {
            "Play": function() {
                var lvl_desc = $('#level_expr_input').val();
                var goal_desc = $('#goal_expr_input').val();
                loadCustomLevel(lvl_desc, goal_desc);
                Resource.play('victory');
                dialog.dialog( "close" );
            },
            Cancel: function() {
              dialog.dialog( "close" );
            }
          },
          close: function() {
            //form[ 0 ].reset();
            //allFields.removeClass( "ui-state-error" );
          }
        });

        $("#"+id).on("click", function() {
            dialog.dialog( "open" );
        });
    } catch(e) {
        console.error('@ setWriteALevelPopup: ', e);
    }
}
