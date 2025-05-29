export const PREVIEW_HTML = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NAME_PLACE_HOLDER</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            height: 200px;
            width: 400px;
            overflow: hidden;
            font-size: 0.9em;
            display: flex;
            align-items: center;
            border: 1px solid #ddd;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
            padding: 10px;
            box-sizing: border-box;
        }
        .image-wrapper {
            width: 100px;
            text-align: center;
            overflow: hidden;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .image-wrapper img {
            height: 100px;
            width: auto;
            display: block;
        }
        .details-wrapper {
            flex-grow: 1;
            /* Add this for wrapping long text */
            word-wrap: break-word; /* For older browsers */
            overflow-wrap: break-word; /* Modern standard */
        }
        .details-wrapper a {
            text-decoration: none;
            color: #007bff;
            font-weight: bold;
            font-size: 1.1em;
        }
        .details-wrapper a:hover {
            text-decoration: underline;
        }
        .details-wrapper .id-code {
            color: #777;
            font-size: 0.9em;
            margin-left: 5px;
        }
        .details-wrapper p {
            margin: 1px 0 0 0;
            color: #555;
        }
    </style>
</head>
<body>
BODY_PLACE_HOLDER
</body>
</html>`
;