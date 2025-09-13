function createContextMenu() {
  chrome.contextMenus.create({
    id: "saveImageAs",
    title: "Save image as",
    contexts: ["image"]
  });

  const imageFormats = ["PNG", "JPG"];
  imageFormats.forEach(format => {
    chrome.contextMenus.create({
      id: `saveImageAs-${format}`,
      parentId: "saveImageAs",
      title: format,
      contexts: ["image"]
    });
  });

  chrome.contextMenus.create({
    id: "saveVideoAs",
    title: "Save video as",
    contexts: ["video"]
  });

  const videoFormats = ["MP4", "MP3"];
  videoFormats.forEach(format => {
    chrome.contextMenus.create({
      id: `saveVideoAs-${format}`,
      parentId: "saveVideoAs",
      title: format,
      contexts: ["video"]
    });
  });
}

function removeContextMenu() {
  chrome.contextMenus.removeAll();
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['imageDownloaderEnabled'], function(result) {
    if (result.imageDownloaderEnabled !== false) {
      createContextMenu();
    }
  });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.imageDownloaderEnabled) {
    if (changes.imageDownloaderEnabled.newValue) {
      createContextMenu();
    } else {
      removeContextMenu();
    }
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const menuItemId = info.menuItemId;
  const srcUrl = info.srcUrl;

  if (menuItemId.startsWith("saveImageAs-")) {
    const format = menuItemId.split("-")[1];
    downloadMedia(srcUrl, format);
  } else if (menuItemId.startsWith("saveVideoAs-")) {
    const format = menuItemId.split("-")[1];
    downloadMedia(srcUrl, format);
  }
});

async function downloadMedia(url, format) {
  try {
    const blob = await fetch(url).then(r => r.blob());
    const imageBitmap = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');

    if (format.toLowerCase() === 'jpg') {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(imageBitmap, 0, 0);

    let mimeType = `image/${format.toLowerCase()}`;
    if (format.toLowerCase() === 'jpg') {
      mimeType = 'image/jpeg';
    }

    const outputBlob = await canvas.convertToBlob({ type: mimeType });

    const dataUrl = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(outputBlob);
    });

    chrome.downloads.download({
      url: dataUrl,
      filename: `download.${format.toLowerCase()}`
    });
  } catch (error) {
    chrome.downloads.download({
      url: url,
      filename: `download_original.${url.split('.').pop()}`
    });
  }
}