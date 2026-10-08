// Renders each page of a PDF to JPG so the layout can be checked by eye.
//   swift pipeline/render-pdf.swift <file.pdf> <out-prefix>   → <out-prefix>-1.jpg, -2.jpg…
import PDFKit
import AppKit
let args = CommandLine.arguments
let doc = PDFDocument(url: URL(fileURLWithPath: args[1]))!
let out = args[2]
print("pages:", doc.pageCount)
for i in 0..<doc.pageCount {
  let page = doc.page(at: i)!
  let img = page.thumbnail(of: NSSize(width: 620, height: 877), for: .mediaBox)
  let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
  try! rep.representation(using: .jpeg, properties: [.compressionFactor: 0.7])!.write(to: URL(fileURLWithPath: "\(out)-\(i+1).jpg"))
}
