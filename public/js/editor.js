// элементы ввода данных
let titleText = document.getElementById("editor__title_text");
let descriptionText = document.getElementById("editor__description_textarea");
let keywordsText = document.getElementById("editor__keywords_text");
let categorySelect = document.getElementById("editor__category_select");
let statusSelect = document.getElementById("editor__status_select");
let contentTextarea = document.getElementById("editor__content_textarea");

// для работа с главным изображением
let imageFile = document.getElementById("editor__image_file"); // это выбор файла
let selectedImage = document.getElementById("editor__selected_image"); // это отображение файла

// кнопка сохранения и отмены
let saveButton = document.getElementById("editor__save_button");
let cancelButton = document.getElementById("editor__cancel_button");

// кнопка открытия диалога выбора изображения для загрузки на сервер
let execCommandImage = document.getElementById("editor__exec_image");

// диалог выбора изображения
let selectImageDialog = document.getElementById("select-image__dialog");
let selectImageDialogFile = document.getElementById("select-image__file");
let selectImageDialogAccept = document.getElementById("select-image__dialog_accept");
let selectImageDialogCancel = document.getElementById("select-image__dialog_close");

// функция загружает изображение на сервер и возвращаеть его url адрес
function uploadImage(file)
{
    return new Promise((resolve, reject) =>
    {
        let fileReader = new FileReader();

        fileReader.onload = async function(e)
        {
            // в параметре передаем имя файла, так как нужно узнать расширение
            const response = await fetch("/upload/image?name=" + file.name,
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/octet-stream"
                },
                body: new Uint8Array(fileReader.result)
            });
            if(!response.ok)
            {
                reject(Error());
                return;
            }

            // сервер возвращает новое имя файла (все загруженные файлы располагаются в "/upload/img/")
            let imagePath = await response.text();
            return imagePath != "" ? resolve("/upload/img/" + imagePath) : reject(Error());
        }

        fileReader.readAsArrayBuffer(file);
    });
}

imageFile.onchange = async function()
{
    try
    {
        if (imageFile.files.length > 0)
        {
            let imageSrc = await uploadImage(imageFile.files[0]);
            selectedImage.setAttribute("src", imageSrc);
        }
    }
    catch (error)
    {
        alert("Не удалось загрузить изображение!");
    }
}

execCommandImage.onclick = function()
{
    selectImageDialog.showModal();
}

// обработчик загружает изображение на сервер
selectImageDialogAccept.onclick = async function()
{
    if (selectImageDialogFile.files.length > 0)
    {
        try
        {
            let imageSrc = await uploadImage(selectImageDialogFile.files[0]); // тут получаем путь к изображени
            contentTextarea.value += `<img src="${imageSrc}" alt="${titleText.value}">`; // добавляем его в наш контент
            selectImageDialog.close(); // закрываем диалог
        }
        catch (error)
        {
            alert(error.message);
        }
    }
}

selectImageDialogCancel.onclick = function()
{
    selectImageDialog.close();
}

saveButton.onclick = async function()
{
    // переменная будет содержат в себе строку с ошибками
    let errorMessage = "";

    // проверяем поля ввода
    if (!titleText.value) errorMessage += "Поле 'Заголовок' не заполнено!\n";
    if (!descriptionText.value) errorMessage += "Поле 'Описание' не заполнено!\n";
    if (!keywordsText.value) errorMessage += "Поле 'Ключевые слова' не заполнено!\n";
    if (!categorySelect.value) errorMessage += "Поле 'Категория' не заполнено!\n";
    if (!statusSelect.value) errorMessage += "Поле 'Статус' не заполнено!\n";
    if (!imageFile.files.length) errorMessage += "Поле 'Изображние' не заполнено!\n";
    if (!contentTextarea.value) errorMessage += "Поле 'Содержание' не заполнено!\n";

    // если есть ошибки выводим
    if (errorMessage != "")
    {
        alert(errorMessage);
        return;
    }

    const response = await fetch("/article?accessKey=13258",
    {
        method: "POST",
        headers: 
        {
            "Content-Type": "text/plain; charset=utf-8"
        },
        body: JSON.stringify(
        {
            title: titleText.value,
            description: descriptionText.value,
            keywords: keywordsText.value,
            category: categorySelect.value,
            status: statusSelect.value,
            image: selectedImage.getAttribute("src"),
            content: contentTextarea.value
        })
    });

    if (response.ok)
        window.location = "/";
    else
        alert("Не удалось сохранить статью!");
}

cancelButton.onclick = function()
{
    window.location = "/";
}