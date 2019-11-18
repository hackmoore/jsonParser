/*
    Written by Ed Moore (ed@ed-moore.net)
*/

const numFilters = 3;
let allData;

function processJsonFile(){
    let jsonText;

    console.log("Starting parsing...");

    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }

    const jsonInput = document.getElementById('jsonFile');
    if( !jsonInput ){
        alert("Um, I think this is my bad... Please let me know.");
        return;
    }else if (!jsonInput.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
        return;
    }else if (!jsonInput.files[0]) {
        alert("Um, div you select a file?");
        return;
    }

    const jsonFile = jsonInput.files[0];
    const reader = new FileReader();

    reader.onload = (function (theFile) {
        return function (e) {
            allData = JSON.parse(e.target.result);
            processJson(allData.data);
        }
    })(jsonFile);
    reader.readAsText(jsonFile);

    $("#step1").removeClass('d-none');
}

function processJson(data){
    // let fields = getFields('', data[0]);
    let fields = getFields(data[0], '.');
    let optionsHTML = '<option value="">No Filter</option>\n';
    
    $("#section-select").html('');
    $.each(fields, function(i){
        $("#section-select").append("<div class='form-check'><input type='checkbox' class='form-check-input' id='select-select" + i + "' value='" + fields[i] + "'><label class='form-check-label' for='select-select" + i + "'>" + fields[i] + "</label></div>");
        optionsHTML += "<option>" + fields[i] + "</option>\n";
    });


    for(let i = 0; i < numFilters; i += 1){
        $("#select-filter" + i).html(optionsHTML);
    }

    bindEvents();
}

/*
    const predicateA = (field: string, value: any): boolean => { return field === "country_code" && value === "ar"; };
    const predicateB = (field: string, value: any): boolean => { return field === "distributors.id" && (value === 3464 || value === 4056); };
    const predicateC = (field: string, value: any): boolean => { return field === "distributors.state" && value === "C"; };
    console.log(queryJson(data, [predicateC]));
*/

function filterData(){
    let selects = [];
    let filters = [];

    // Get all the selects
    $("#section-select input:checked").each(function(){
        selects.push($(this).val());
        filters.push((field, value) => { return field === $(this).val(); });
    });

    if( selects.length == 0 ){
        alert("Please complete step 2!");
        return;
    }

    // Get all the filters
    $("#section-filter select").each(function(){
        const filterField = $(this).val();

        if( filterField != '' ){
            const filterValue = $("#" + $(this).attr('triggerid')).val();

            filters.push((field, value) => {
                let match = value.toString().match(new RegExp(filterValue));
                return filterField === field && match && value === match[0]; //value.match(new RegExp(filterValue));// === $("#" + $(this).attr('triggerid')).val();
            });
        }
    });

    const matches = queryJson(allData.data, filters);

    // Remove the fields that aren't required
    for (k1 in matches) {
        for(k2 = matches[k1].length-1; k2 >= 0; k2--){
            if( !selects.includes(matches[k1][k2].key) ){
                matches[k1].splice(k2, 1);
            }
        }
    }
    console.log(matches);
    writeResults(matches);
    $("#step4").removeClass('d-none');
}


function writeResults(data){
    let str = "";
    $("#results tbody, #results thead").html('');

    for(k1 in data){
        str = "<tr>";
        for(k2 in data[k1]){
            str += "<th>" + data[k1][k2].key + "</th>";
        }
        str += "</tr>";
        $("#results thead").append(str);
        break;
    }

    for (k1 in data) {
        str = "<tr>";
        for (k2 in data[k1]) {
            str += "<td>" + data[k1][k2].value + "</td>";
        }
        str += "</tr>";
        $("#results tbody").append(str);
    }
}

function bindEvents(){
    // Step 2
    $("#section-select input[type='checkbox']").change(function(){
        $("#step2").addClass('d-none');
        if( $("#section-select input[type='checkbox']:checked").length > 0 ){
            $("#step2").removeClass('d-none');
        }
    });


    // Step 3
    $("[trigger]").change(function(){
        // Enable text box
        if( $(this).val() == '' ){
            $("#" + $(this).attr('triggerid')).prop('disabled', true);
        }else{
            $("#" + $(this).attr('triggerid')).prop('disabled', false);
        }

        // Display tick?
        $("#step3").addClass('d-none');
        $("[trigger]").each(function(){
            if( $(this).val() != '' ){
                $("#step3").removeClass('d-none');
            }
        })
    });
}