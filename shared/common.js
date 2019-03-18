const bcrypt = require('bcrypt-nodejs');

exports.generateErrorJSON = (message, details) => {
    return {error: message, details: details};
}

exports.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

exports.matchHash = function (val1, val2) {
    return bcrypt.compareSync(val1, val2);
};

exports.resizeImage = (base64Image, targetSize, callback) => {
    var img = new Image();
    img.onload = () => {
        var width = img.width,
            height = img.height,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext("2d");
    
        canvas.width = canvas.height = targetSize;
    
        ctx.drawImage(
          img,
          width > height ? (width - height) / 2 : 0,
          height > width ? (height - width) / 2 : 0,
          width > height ? height : width,
          width > height ? height : width,
          0, 0,
          targetSize, targetSize
        );
    
        callback(canvas.toDataURL());
      };
      img.src = base64Image;
};

exports.toBase64=(file)=>{
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};
