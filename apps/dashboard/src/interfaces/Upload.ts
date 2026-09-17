export interface IUpload {
    fileId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedBy?: string;
    url: string;
    createdAt: string;
}
