var testGallery = new LazyGallery("testgallery");
testGallery.add(new LazyGalleryItem(0, "pics/pic1.jpg", "pics/pic1_tn.jpg", "some description 1"));
testGallery.add(new LazyGalleryItem(0, "pics/pic2.jpg", "pics/pic2_tn.jpg", "some description 2"));
testGallery.add(new LazyGalleryItem(0, "pics/pic3.jpg", "pics/pic3_tn.jpg", "some description 3"));

var testGallery2 = new LazyGallery("testgallery2");
testGallery2.add(new LazyGalleryItem(0, "pics/pic4.jpg", "pics/pic4_tn.jpg", "some description 4"));
testGallery2.add(new LazyGalleryItem(0, "pics/pic5.jpg", "pics/pic5_tn.jpg", "some description 4"));
testGallery2.add(new LazyGalleryItem(0, "pics/pic6.jpg", "pics/pic6_tn.jpg", "some description 4"));

var lazyGalleryView = new LazyGalleryView(testGallery2);
lazyGalleryView.init();