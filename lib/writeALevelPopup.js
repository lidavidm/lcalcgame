function setWriteALevelPopup(id, formid, onEnter) {

    try {

        (function(){

            function onChange(event) {
                var reader = new FileReader();
                reader.onload = onReaderLoad;
                reader.readAsText(event.target.files[0]);
            }

            function onReaderLoad(event){
                console.log(event.target.result);
                var obj = JSON.parse(event.target.result);
                load_chapter(obj);
            }

            function load_chapter(json){
                alert('Loaded chapter:\n"' + json.chapterName + ', ' + json.description + '"\nin drop-down chapter select.');
                Resource.pushChapter(json);
                Resource.play('victory');
                dialog.dialog( "close" );
                loadChapterSelect();
            }

            document.getElementById('add_chapter_json').addEventListener('change', onChange);

        }());


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
