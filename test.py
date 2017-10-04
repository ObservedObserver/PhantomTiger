import cv2

cap = cv2.VideoCapture(0)

while(True):
    ret, image = cap.read()
    _,image = cv2.threshold(image,40,255,cv2.THRESH_BINARY)
    grayscaled = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    # print image
    gaus = cv2.adaptiveThreshold(grayscaled, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 115,1)
    cv2.imshow("threshold",gaus)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
