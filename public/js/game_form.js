const queryId = window.location.href.split("?")[1].split("=")[1];
const curtain = parent.document.getElementById('curtain');
const gameForm = document.getElementById('game-form');
const cancelButton = document.getElementById('cancel-button');
const saveButton = document.getElementById('save-button');
const imgCoverInput = document.getElementById('cover-img-input');
const imgCoverPreview = document.getElementById('cover-img-preview');

cancelButton.addEventListener('click', () => curtain.remove());

imgCoverInput.addEventListener('change', () => {
    const reader = new FileReader();
    reader.onload = (e) => imgCoverPreview.src = e.target.result;
    reader.readAsDataURL(imgCoverInput.files[0]);
});

saveButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const form = document.getElementById('game-form');
    const formData = new FormData(form);
    let data = JSON.parse(JSON.stringify(Object.fromEntries(formData.entries())));
    data.is_physical = document.getElementById('is-physical').checked ? 1: 0;
    data.is_completed = data.completion == 100 ? 1 : 0;
    if (data.rating == undefined) data.rating = 0;
    if (queryId != 'new') data.id = queryId;

    let result = await fetch('/api/submit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    result = await result.json();

    if (result.response == 200 && queryId == 'new') {
        top.location.reload(); 
    }
});