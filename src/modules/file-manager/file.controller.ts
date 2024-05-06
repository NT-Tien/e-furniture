import { Controller, Get, Param, Post, Res, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { FileInterceptor, MemoryStorageFile, UploadedFile } from "@blazity/nest-file-fastify";
import { FastifyReply } from "fastify";

const url = 'http://api.caucalamdev.io.vn:8081/';

@ApiTags('file')
@Controller('file')
export class FileController {

    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            },
        },
    })
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: MemoryStorageFile, @Res() res: any) {
        try {
            // convert to blob
            var fileBlob = new Blob([file.buffer], { type: file.mimetype });
            var dataForm = new FormData();
            dataForm.append("file", fileBlob);

            fetch(url + 'file/upload', {
                method: 'POST',
                body: dataForm
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    res.send(data);
                })
                .catch(error => {
                    console.log(error);
                    res.send(error);
                });
        } catch (error) {
            return res.status(500).send(error);
        }
    }

    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            },
        },
    })
    @Post('rewrite/:path')
    @UseInterceptors(FileInterceptor('file'))
    rewriteFile(@UploadedFile() file: MemoryStorageFile, @Param('path') path: string, @Res() res: any) {
        try {
            // convert to blob
            var fileBlob = new Blob([file.buffer], { type: file.mimetype });
            var dataForm = new FormData();
            dataForm.append("file", fileBlob);

            fetch(url + 'file/rewrite/image/' + path, {
                method: 'POST',
                body: dataForm
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    res.send(data);
                })
                .catch(error => {
                    console.log(error);
                    res.send(error);
                });
        } catch (error) {
            res.status(500).send(error);
        }
    }

    // get image to show
    @Get('show/:path')
    showFile(@Param('path') path: string, @Res() res: FastifyReply) {
        fetch(url + 'image/' + path)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.arrayBuffer();
            })
            .then(buffer => {
                const image = Buffer.from(buffer);
                res.header('Content-Type', 'image/png');
                res.send(image);
            })
            .catch(error => {
                res.send(error);
            });
    }

    // get pdf to show
    @Get('show-pdf/:path')
    showPdf(@Param('path') path: string, @Res() res: FastifyReply) {
        fetch(url + 'image/' + path)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.arrayBuffer();
            })
            .then(buffer => {
                const pdf = Buffer.from(buffer);
                res.header('Content-Type', 'application/pdf');
                res.send(pdf);
            })
            .catch(error => {
                res.send(error);
            });
    }

} 