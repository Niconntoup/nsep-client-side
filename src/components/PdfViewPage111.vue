<template>
    <div class="pdf-view-container">
        <div class="column-wrapper">
            <!-- Left Column (20%) -->
            <div class="column column-left">
                <iframe style="width: 100%; height: 100%; border: none;" src="/教材帮 高中数学 选择性必修第三册 RJA.pdf"></iframe>
            </div>

            <!-- Middle Column (40%) -->
            <div class="column column-middle">
                <!-- Content for middle column -->
                <p>Middle Column (40%)</p>
            </div>

            <!-- Right Column (40%) -->
            <div class="column column-right">
                <!-- Content for right column -->
                <p>Right Column (40%)</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pdf-view-container {
    height: calc(100vh - 120px);
    /* 100vh - header height (80px) - padding (20px*2) */
    width: 100%;
}

.column-wrapper {
    display: flex;
    height: 100%;
    width: 100%;
    gap: 20px;
    /* Optional: adds space between columns */
}

.column {
    height: 100%;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 20px;
    box-sizing: border-box;
    /* Ensures padding is included in the width/height */
}

.column-left {
    flex: 0 0 20%;
}

.column-middle {
    flex: 0 0 40%;
}

.column-right {
    flex: 0 0 40%;
}
</style>