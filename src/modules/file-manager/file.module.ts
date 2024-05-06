import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FileController } from "./file.controller";

@Module({
    // imports: [
    //     MongooseModule.forFeature(
    //         [{ name: File.name, schema: FileSchema }]
    //     ),
    // ],
    controllers: [FileController],
})
export class FileModule { }