const dropZone=document.querySelector('.drop-zone');
const fileInput=document.querySelector('#fileinput');
const browseBtn=document.querySelector('.browseBtn');
const bgProgress=document.querySelector(".bg-progress");
const percentDiv=document.querySelector('#percent');
const progressBar=document.querySelector(".progress-bar");
const progressContainer=document.querySelector('.progress-container');
const fileURLInput=document.querySelector("#fileURL");
const sharingContainer=document.querySelector('.sharing-container');
const copyBtn=document.querySelector('#copyBtn');

const emailForm=document.querySelector("#emailForm");
const toast=document.querySelector('.toast')


const host="https://file-share-here.herokuapp.com/"
const uploadURL=host+"api/files";
const emailURL=host+"api/files/send";

// const uploadURL="http://localhost:3300/single"

const maxAllowedSize=2024*1024*1024;

dropZone.addEventListener("dragover",(e)=>{
    e.preventDefault()
    if(!dropZone.classList.contains("dragged")){

        dropZone.classList.add('dragged')
    }
})

dropZone.addEventListener('dragleave',()=>{
    dropZone.classList.remove("dragged");
})

dropZone.addEventListener('drop',(e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files=e.dataTransfer.files;
    console.log(files)
    if(files.length){
        fileInput.files=files;
        uploadFile();
    }
    
})

fileInput.addEventListener("change",()=>{
    uploadFile()
})

browseBtn.addEventListener("click",()=>{
    fileInput.click();
})

copyBtn.addEventListener('click',async (event)=>{
    // fileURLInput.select()
    // document.execCommand("copy");

    const text = fileURLInput.value;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to Clipboard")
  } catch (err) {
    console.error('Failed to copy!', err)
  }
})

const uploadFile=async ()=>{
    if(fileInput.files.length>1){
        showToast("Only 1 file allowed")
        resetFileInput()
        return
    }

    if(fileInput.files[0].size>maxAllowedSize){
        showToast("Cannot upload more than 2 gb");
        resetFileInput();
        return
    }

    progressContainer.style.display="block"
    const file=fileInput.files[0];
    const formData=new FormData();
    formData.append('myfile',file)
    const xhr=new XMLHttpRequest();

    // this gives event state 
    xhr.onreadystatechange=()=>{
        if(xhr.readyState===XMLHttpRequest.DONE){
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    }

    xhr.upload.onprogress=updateProgress;

    xhr.upload.onerror=()=>{
        resetFileInput()
        showToast(`Error in upload: ${xhr.statusText}`)
    }

    xhr.open("POST",uploadURL);
    xhr.send(formData);
}

const updateProgress=(e)=>{
    const percent=Math.round((e.loaded/e.total)*100);
    bgProgress.style.width=`${percent}%`
    percentDiv.innerText=percent;
    progressBar.style.transform=`scaleX(${percent/100})`
}

const onUploadSuccess=({file:url})=>{
    // console.log(url);
    emailForm[2].removeAttribute("disabled");
    resetFileInput();

    progressContainer.style.display="none";
    sharingContainer.style.display="block";
    fileURLInput.value=url;
}

const resetFileInput=()=>{
    fileInput.value="";
}

emailForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    console.log("submit form")

    const url=fileURLInput.value;

    const formData={
        uuid:url.split("/").splice(-1,1)[0],
        emailTo:emailForm.elements["to-email"].value,
        emailFrom:emailForm.elements["from-email"].value
    }
    emailForm[2].setAttribute("disabled",'true')

    console.log(formData);

    fetch(emailURL,{
        method:"POST",
        headers:{
            "Content-type":"application/json"
        },
        body:JSON.stringify(formData)
    }).then(res=>res.json())
    .then(({success})=>{
        if(success){
            sharingContainer.style.display="none";
            showToast("Email sent")
        }
    })
})


let toastTimer;
const showToast=(msg)=>{
    toast.innerText=msg;
    toast.style.transform="translate(-50%,0)";
    toast.style.display="block";
    clearTimeout(toastTimer)
    toastTimer=setTimeout(()=>{
        toast.style.transform="translate(-50%,60px)";
    toast.style.display="none";

    },2000);
}




